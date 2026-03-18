from django.db.models import Count, Exists, F, OuterRef, Q
from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from actions.models import AssignmentStatus, ItemAssignment
from audit.models import InventoryAuditLog
from catalog.models import Category
from common.access import scope_queryset_by_user
from common.pagination import IMSPageNumberPagination
from inventory.models import ConsumableStock, ConsumableStockTransaction, FixedAsset, InventoryItem, InventoryStatus


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        item_qs = scope_queryset_by_user(InventoryItem.objects.all(), request.user, "office_id")
        assignment_qs = scope_queryset_by_user(ItemAssignment.objects.all(), request.user, "item__office_id")
        stock_qs = scope_queryset_by_user(ConsumableStock.objects.all(), request.user, "item__office_id")
        fixed_qs = scope_queryset_by_user(FixedAsset.objects.all(), request.user, "item__office_id")
        item_counts = item_qs.aggregate(
            total_inventory_items=Count("id"),
            active_inventory_items=Count("id", filter=Q(status=InventoryStatus.ACTIVE)),
            disposed_inventory_items=Count("id", filter=Q(status=InventoryStatus.DISPOSED)),
            active_offices=Count("office_id", distinct=True),
        )
        assignment_counts = assignment_qs.aggregate(
            active_assignments=Count("id", filter=Q(status=AssignmentStatus.ASSIGNED)),
            returned_assignments=Count("id", filter=Q(status=AssignmentStatus.RETURNED)),
            assigned_assets=Count("item_id", filter=Q(status=AssignmentStatus.ASSIGNED), distinct=True),
        )
        stock_counts = stock_qs.aggregate(
            consumable_stocks=Count("id"),
            low_stock_items=Count(
                "id",
                filter=Q(reorder_alert_enabled=True, quantity__lte=F("min_threshold")),
            ),
        )
        total_items = item_counts["total_inventory_items"] or 0
        assigned_count = assignment_counts["assigned_assets"] or 0
        unassigned_count = max(total_items - assigned_count, 0)
        data = {
            "total_inventory_items": total_items,
            "active_inventory_items": item_counts["active_inventory_items"] or 0,
            "disposed_inventory_items": item_counts["disposed_inventory_items"] or 0,
            "fixed_assets": fixed_qs.count(),
            "consumable_stocks": stock_counts["consumable_stocks"] or 0,
            "active_assignments": assignment_counts["active_assignments"] or 0,
            "returned_assignments": assignment_counts["returned_assignments"] or 0,
            "low_stock_items": stock_counts["low_stock_items"] or 0,
            "assigned_assets": assigned_count,
            "unassigned_assets": unassigned_count,
            "active_offices": item_counts["active_offices"] or 0,
        }
        return Response(data)


class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        if not query:
            return Response([])

        try:
            limit = int(request.query_params.get("limit", 10))
        except (TypeError, ValueError):
            limit = 10
        limit = min(max(limit, 1), 25)
        active_assignment_exists = ItemAssignment.objects.filter(
            item_id=OuterRef("pk"),
            status=AssignmentStatus.ASSIGNED,
        )

        items = (
            scope_queryset_by_user(
                InventoryItem.objects.filter(Q(title__icontains=query) | Q(item_number__icontains=query)),
                request.user,
                "office_id",
            )
            .annotate(has_active_assignment=Exists(active_assignment_exists))
            .order_by("-created_at")[:limit]
        )
        categories = Category.objects.filter(name__icontains=query).order_by("name")[:limit]
        stocks = (
            scope_queryset_by_user(
                ConsumableStock.objects.select_related("item").filter(
                    Q(item__title__icontains=query) | Q(item__item_number__icontains=query) | Q(unit__icontains=query)
                ),
                request.user,
                "item__office_id",
            )
            .order_by("id")[:limit]
        )
        movements = (
            scope_queryset_by_user(
                ConsumableStockTransaction.objects.select_related("stock", "stock__item").filter(
                    Q(stock__item__title__icontains=query)
                    | Q(stock__item__item_number__icontains=query)
                    | Q(description__icontains=query)
                    | Q(department__icontains=query)
                ),
                request.user,
                "stock__item__office_id",
            )
            .order_by("-created_at")[:limit]
        )
        audits = (
            scope_queryset_by_user(
                InventoryAuditLog.objects.select_related("item", "performed_by").filter(
                    Q(item__title__icontains=query)
                    | Q(item__item_number__icontains=query)
                    | Q(remarks__icontains=query)
                    | Q(performed_by__username__icontains=query)
                ),
                request.user,
                "item__office_id",
            )
            .order_by("-created_at")[:limit]
        )
        assignments = (
            scope_queryset_by_user(
                ItemAssignment.objects.select_related("item").filter(
                    Q(item__title__icontains=query)
                    | Q(item__item_number__icontains=query)
                    | Q(remarks__icontains=query)
                    | Q(assigned_to_user__username__icontains=query)
                    | Q(assigned_to_office__name__icontains=query)
                ),
                request.user,
                "item__office_id",
            )
            .order_by("-created_at")[:limit]
        )

        data = [
            {
                "key": f"item-{item.id}",
                "kind": "Item",
                "title": item.title,
                "details": (
                    f"{item.item_number or '-'} | "
                    f"{'Fixed Asset' if item.item_type == 'FIXED_ASSET' else 'Consumable'} | "
                    f"{'ASSIGNED' if item.has_active_assignment else 'UNASSIGNED'}"
                ),
            }
            for item in items
        ]
        data.extend(
            {
                "key": f"category-{category.id}",
                "kind": "Category",
                "title": category.name,
                "details": "Consumable" if category.is_consumable else "Fixed Asset",
            }
            for category in categories
        )
        data.extend(
            {
                "key": f"stock-{stock.id}",
                "kind": "Stock",
                "title": stock.item.title,
                "details": (
                    f"{stock.item.item_number or '-'} | Qty {stock.quantity} {stock.unit} | "
                    f"Min {stock.min_threshold} | "
                    f"{'OUT OF STOCK' if stock.quantity <= 0 else 'LOW STOCK' if stock.quantity <= stock.min_threshold else 'ON BOARDED'}"
                ),
            }
            for stock in stocks
        )
        data.extend(
            {
                "key": f"movement-{movement.id}",
                "kind": "Stock Movement",
                "title": movement.stock.item.title,
                "details": (
                    f"{movement.transaction_type.replace('_', ' ')} | "
                    f"Qty {movement.quantity} | Balance {movement.balance_after}"
                ),
            }
            for movement in movements
        )
        data.extend(
            {
                "key": f"audit-{audit.id}",
                "kind": "Audit Log",
                "title": audit.item.title,
                "details": (
                    f"{audit.action_type} | "
                    f"{(audit.performed_by.get_full_name() or audit.performed_by.username) if audit.performed_by else '-'} | "
                    f"{audit.remarks or '-'}"
                ),
            }
            for audit in audits
        )
        data.extend(
            {
                "key": f"assignment-{assignment.id}",
                "kind": "Assignment",
                "title": assignment.item.title,
                "details": (
                    f"{assignment.status} | Assign till {assignment.assign_till or '-'} | "
                    f"{assignment.created_at.date().isoformat()}"
                ),
            }
            for assignment in assignments
        )
        return Response(data)


class LowStockReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        stocks_qs = scope_queryset_by_user(ConsumableStock.objects.all(), request.user, "item__office_id")
        stocks = (
            stocks_qs.select_related("item", "item__office", "item__category")
            .filter(reorder_alert_enabled=True, quantity__lte=F("min_threshold"))
            .order_by("quantity", "id")
        )

        data = [
            {
                "stock_id": stock.id,
                "item_id": stock.item_id,
                "title": stock.item.title,
                "office": stock.item.office.name,
                "category": stock.item.category.name,
                "quantity": stock.quantity,
                "min_threshold": stock.min_threshold,
                "unit": stock.unit,
            }
            for stock in stocks
        ]
        return Response(data)


class AssignmentSummaryByOfficeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        scoped_qs = scope_queryset_by_user(ItemAssignment.objects.all(), request.user, "item__office_id")
        data = list(
            scoped_qs.values("item__office__id", "item__office__name")
            .annotate(
                total=Count("id"),
                active=Count("id", filter=Q(status=AssignmentStatus.ASSIGNED)),
                returned=Count("id", filter=Q(status=AssignmentStatus.RETURNED)),
            )
            .order_by("item__office__name")
        )
        return Response(data)


class RecentInventoryActivitiesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = IMSPageNumberPagination

    def get(self, request):
        logs_qs = scope_queryset_by_user(InventoryAuditLog.objects.all(), request.user, "item__office_id")
        search = (request.query_params.get("search") or "").strip()
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        action_type = request.query_params.get("action_type")
        item_type = request.query_params.get("item_type")
        category = request.query_params.get("category")
        logs = logs_qs.select_related("item", "performed_by").all()
        if search:
            logs = logs.filter(
                Q(item__title__icontains=search)
                | Q(item__item_number__icontains=search)
                | Q(remarks__icontains=search)
                | Q(performed_by__username__icontains=search)
                | Q(performed_by__first_name__icontains=search)
                | Q(performed_by__last_name__icontains=search)
            )
        if from_date:
            logs = logs.filter(created_at__date__gte=from_date)
        if to_date:
            logs = logs.filter(created_at__date__lte=to_date)
        if action_type:
            logs = logs.filter(action_type=action_type)
        if item_type:
            logs = logs.filter(item__item_type=item_type)
        if category:
            logs = logs.filter(item__category_id=category)
        logs = logs.order_by("-created_at")
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(logs, request, view=self)
        data = [
            {
                "id": log.id,
                "item_name": log.item.title,
                "unique_number": log.item.item_number,
                "performed_by": (log.performed_by.get_full_name() or log.performed_by.username) if log.performed_by else None,
                "date": log.created_at.date(),
                "amount": str(log.item.amount),
                "status": log.action_type,
                "action": log.remarks,
            }
            for log in (page if page is not None else logs[:50])
        ]
        if page is not None:
            return paginator.get_paginated_response(data)
        return Response(data)


class InventoryReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = scope_queryset_by_user(InventoryItem.objects.all(), request.user, "office_id").select_related("category", "office").order_by("-created_at")
        category = request.query_params.get("category")
        status = request.query_params.get("status")
        office = request.query_params.get("office")
        fiscal_year = request.query_params.get("fiscal_year")

        if category:
            queryset = queryset.filter(category_id=category)
        if status:
            queryset = queryset.filter(status=status)
        if office:
            queryset = queryset.filter(office_id=office)

        # Fiscal year format: YYYY-YYYY, window from Jul 16 first year to Jul 15 second year.
        if fiscal_year and "-" in fiscal_year:
            start_year, end_year = fiscal_year.split("-", 1)
            if start_year.isdigit() and end_year.isdigit():
                queryset = queryset.filter(
                    purchased_date__gte=f"{start_year}-07-16",
                    purchased_date__lte=f"{end_year}-07-15",
                )

        return queryset

    def get(self, request):
        queryset = self.get_queryset(request)
        data = self.serialize_items(queryset)
        return Response(data)

    @staticmethod
    def serialize_items(queryset):
        return [
            {
                "id": item.id,
                "item_name": item.title,
                "item_number": item.item_number,
                "item_type": item.item_type,
                "category": item.category.name,
                "office": item.office.name,
                "status": item.status,
                "amount": str(item.amount),
                "purchased_date": item.purchased_date,
            }
            for item in queryset
        ]


class InventoryReportExportCSVView(InventoryReportView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = self.get_queryset(request)
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="inventory_report.csv"'
        response.write("item_name,item_number,item_type,category,office,status,amount,purchased_date\n")
        for item in queryset:
            response.write(
                f'"{item.title}","{item.item_number or ""}","{item.item_type}","{item.category.name}","{item.office.name}","{item.status}","{item.amount}","{item.purchased_date or ""}"\n'
            )
        return response


class InventoryReportExportExcelView(InventoryReportView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = self.get_queryset(request)
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Inventory Report"

        headers = ["Item Name", "Item Number", "Item Type", "Category", "Office", "Status", "Amount", "Purchased Date"]
        sheet.append(headers)

        for item in queryset:
            sheet.append(
                [
                    item.title,
                    item.item_number or "",
                    item.item_type,
                    item.category.name,
                    item.office.name,
                    item.status,
                    float(item.amount),
                    item.purchased_date.isoformat() if item.purchased_date else "",
                ]
            )

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="inventory_report.xlsx"'
        workbook.save(response)
        return response


class InventoryReportExportPDFView(InventoryReportView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = self.get_queryset(request)
        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="inventory_report.pdf"'

        pdf = canvas.Canvas(response, pagesize=A4)
        width, height = A4
        y = height - 40

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "DoNIDCR - Inventory Report")
        y -= 20

        pdf.setFont("Helvetica", 9)
        pdf.drawString(40, y, "Item Name")
        pdf.drawString(210, y, "Item Number")
        pdf.drawString(300, y, "Category")
        pdf.drawString(390, y, "Office")
        pdf.drawString(480, y, "Status")
        y -= 14

        for item in queryset:
            if y < 50:
                pdf.showPage()
                y = height - 40
                pdf.setFont("Helvetica-Bold", 12)
                pdf.drawString(40, y, "DoNIDCR - Inventory Report (cont.)")
                y -= 20
                pdf.setFont("Helvetica", 9)

            pdf.drawString(40, y, (item.title or "")[:28])
            pdf.drawString(210, y, (item.item_number or "")[:14])
            pdf.drawString(300, y, (item.category.name or "")[:14])
            pdf.drawString(390, y, (item.office.name or "")[:14])
            pdf.drawString(480, y, (item.status or "")[:10])
            y -= 14

        pdf.save()
        return response
