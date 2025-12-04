import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPermissionsByRole } from "../api/permissionService";
import { handleError } from "../utils/handleError";

export const useSyncPermissions = () => {
  const { user, updateUserPermissions } = useContext(AuthContext);

  useEffect(() => {
    const syncPermissions = async () => {
      if (user && user.role?._id) {
        try {
          const res = await getPermissionsByRole(user.role._id);
          if (res.data && res.data.success) {
            const permissionKeys = res.data.data.map((p) => p.key);
            updateUserPermissions(permissionKeys);
          }
        } catch (err) {
          handleError(err);
        }
      }
    };

    syncPermissions();
  }, []);
};
