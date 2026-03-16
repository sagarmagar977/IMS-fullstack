from users.models import UserRoles
from hierarchy.models import Office


GLOBAL_ROLES = {
    UserRoles.SUPER_ADMIN,
    UserRoles.CENTRAL_ADMIN,
    UserRoles.CENTRAL_PROCUREMENT_STORE,
    UserRoles.FINANCE,
    UserRoles.AUDIT,
}

SCOPED_ROLES = {
    UserRoles.PROVINCIAL_ADMIN,
    UserRoles.LOCAL_ADMIN,
    UserRoles.WARD_OFFICER,
}


def get_descendant_office_ids(root_office_id):
    if not root_office_id:
        return []
    children_by_parent: dict[int | None, list[int]] = {}
    for office_id, parent_office_id in Office.objects.values_list("id", "parent_office_id"):
        children_by_parent.setdefault(parent_office_id, []).append(office_id)

    office_ids = set()
    frontier = [root_office_id]
    while frontier:
        current_id = frontier.pop()
        if current_id in office_ids:
            continue
        office_ids.add(current_id)
        frontier.extend(children_by_parent.get(current_id, []))
    return list(office_ids)


def get_accessible_office_ids(user):
    if hasattr(user, "_accessible_office_ids_cache"):
        return user._accessible_office_ids_cache

    if user.is_staff or user.is_superuser:
        office_ids = None
    elif user.role in GLOBAL_ROLES:
        office_ids = None
    elif user.role in SCOPED_ROLES:
        if user.role == UserRoles.WARD_OFFICER:
            office_ids = [user.office_id] if user.office_id else []
        else:
            office_ids = get_descendant_office_ids(user.office_id)
    else:
        office_ids = []

    user._accessible_office_ids_cache = office_ids
    return office_ids


def scope_queryset_by_user(queryset, user, office_lookup):
    office_ids = get_accessible_office_ids(user)
    if office_ids is None:
        return queryset
    return queryset.filter(**{f"{office_lookup}__in": office_ids})
