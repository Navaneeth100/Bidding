

export const hasPermission = (codename) => {
    try {
        const token = localStorage.getItem("authTokens");
        const parsed = JSON.parse(token);
        const menus = parsed?.menus || [];

        const check = (items) => {
            for (const item of items) {
                // Check direct permissions
                if (
                    item.permissions?.some(
                        (perm) => perm.codename === codename
                    )
                ) {
                    return true;
                }

                // Recursively check children
                if (item.children && item.children.length > 0) {
                    if (check(item.children)) return true;
                }
            }
            return false;
        };

        return check(menus);
    } catch (error) {
        console.error("Permission check error:", error);
        return false;
    }
};
