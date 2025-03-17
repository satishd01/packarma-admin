import React, { useEffect, useState } from "react";
import { Permission } from "../context/userContext";
import { BACKEND_API_KEY } from "../../utils/ApiKey";
import api from "../../utils/axiosInstance";
import ToggleSwitch from "./ToggleSwitch";
import { AiOutlineDelete } from "react-icons/ai";
import CustomPopup from "./CustomPopup";

type PermissionType = "can_create" | "can_update" | "can_delete" | "can_export";

type Page = {
  id: number;
  page_name: string;
};

const PermissionsPopup: React.FC<{ id: number }> = ({ id }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [addPagePopupOpen, setAddPagePopupOpen] = useState(false);
  const [permissionIdToDelete, setPermissionIdToDelete] = useState<
    number | null
  >(null);

  const fetchPermissions = async () => {
    const response = await api.get(
      `${BACKEND_API_KEY}/staff/permissions/${id}`,
    );
    setPermissions(response.data.data);
  };

  const fetchPages = async () => {
    try {
      const response = await api.get(`${BACKEND_API_KEY}/staff/pages`);
      setPages(response.data.data.pages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchPages();
  }, []);

  const handleToggle = async (
    pageName: string,
    permissionType: PermissionType,
  ) => {
    const updatedPermissions = permissions?.map((permission: Permission) =>
      permission.page_name === pageName
        ? {
            ...permission,
            [permissionType]: permission[permissionType] === 1 ? 0 : 1,
          }
        : permission,
    );

    setPermissions(updatedPermissions);

    const updatedPermission = updatedPermissions.find(
      (permission) => permission.page_name === pageName,
    );

    if (updatedPermission) {
      try {
        await api.put(
          `${BACKEND_API_KEY}/staff/permissions/${updatedPermission.id}`,
          {
            [permissionType]: updatedPermission[permissionType],
            page_id: updatedPermission.page_id,
          },
        );
      } catch (error) {
        console.error("Failed to update permission", error);
        setPermissions(permissions);
      }
    } else {
      console.error("Updated permission not found");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(
        `${BACKEND_API_KEY}/staff/permissions/${permissionIdToDelete}`,
      );
      setPermissions(
        permissions.filter(
          (permission) => permission.id !== permissionIdToDelete,
        ),
      );
      setDeletePopupOpen(false);
    } catch (error) {
      console.error("Failed to delete permission", error);
      setPermissions(permissions);
    }
  };

  const deletePermission = (id: number) => {
    setPermissionIdToDelete(id);
    setDeletePopupOpen(true);
  };

  const handleAddPage = async (page: Page) => {
    try {
      const response = await api.post(`${BACKEND_API_KEY}/staff/permissions`, {
        page_id: page.id,
        admin_id: id,
        can_create: 0,
        can_read: 0,
        can_update: 0,
        can_delete: 0,
        can_export: 0,
      });
      setPermissions([
        ...permissions,
        {
          page_id: page.id,
          page_name: page.page_name,
          can_create: 0,
          can_update: 0,
          can_delete: 0,
          can_export: 0,
          id: response.data.data.permissionId,
        },
      ]);
      setAddPagePopupOpen(false);
    } catch (error) {
      console.error("Failed to add page", error);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[70%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Permissions</h2>
          {permissions && permissions.length !== 8 && (
            <button
              className="px-4 ml-auto py-2 text-sm font-medium text-black bg-lime-500 rounded-md hover:bg-lime-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              onClick={() => setAddPagePopupOpen(true)}
            >
              Add Page
            </button>
          )}
        </div>
        <p className="mb-4 text-sm">
          Click "Add Page" to create add pages to this user and set permissions
        </p>
        <table className="w-full text-sm text-left text-gray-900">
          <thead className="text-xs text-gray-900 uppercase bg-gray-200 rounded-md">
            <tr>
              <th className="px-4 py-2">Page Name</th>
              <th className="px-4 py-2 text-center">Create</th>
              <th className="px-4 py-2 text-center">Update</th>
              <th className="px-4 py-2 text-center">Delete</th>
              <th className="px-4 py-2 text-center">Export</th>
              <th className="px-4 py-2 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {permissions &&
              permissions.map((permission) => (
                <tr key={permission.page_name} className="border-b">
                  <td className="px-4 py-3">{permission.page_name}</td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={permission.can_create === 1}
                      onChange={() =>
                        handleToggle(permission.page_name, "can_create")
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={permission.can_update === 1}
                      onChange={() =>
                        handleToggle(permission.page_name, "can_update")
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={permission.can_delete === 1}
                      onChange={() =>
                        handleToggle(permission.page_name, "can_delete")
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={permission.can_export === 1}
                      onChange={() =>
                        handleToggle(permission.page_name, "can_export")
                      }
                    />
                  </td>
                  <td className="px-4 py-3 flex justify-center items-center">
                    <button
                      onClick={() => deletePermission(permission.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {deletePopupOpen && (
        <CustomPopup
          title="Delete Permission"
          description="Are you sure you want to delete this permission?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletePopupOpen(false)}
        />
      )}
      {addPagePopupOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setAddPagePopupOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[25%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Add Page</h2>
            <div className="flex flex-col gap-2">
              {pages &&
                pages
                  .filter(
                    (page) =>
                      !permissions.some(
                        (perm) => perm.page_name === page.page_name,
                      ),
                  )
                  .map((page: Page) => (
                    <div key={page.id} className="flex items-center gap-2">
                      <p
                        className="cursor-pointer hover:scale-105"
                        onClick={() => handleAddPage(page)}
                      >
                        {page.page_name}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPopup;
