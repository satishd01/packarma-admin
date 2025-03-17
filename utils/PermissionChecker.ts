export function hasUpdateAndCreatePermissions(
  userContext: any,
  pageName: string,
  permissionType: string
): boolean {
  const permissions = userContext?.user.permissions?.find(
    (permission: any) => permission.page_name === pageName
  );
  return permissions?.[permissionType] === 1;
}
