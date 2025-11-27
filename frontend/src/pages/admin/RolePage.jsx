import { useContext, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Select,
} from "antd";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
} from "../../api/roleService";
import { getPermissions } from "../../api/permissionService";
import { handleError } from "../../utils/handleError";
import { AuthContext } from "../../context/AuthContext";

const { Option } = Select;

export default function RolePage() {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [selectedPermissionsByRole, setSelectedPermissionsByRole] = useState(
    {}
  );
  const [form] = Form.useForm();

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await getPermissions();
      setPermissions(res.data.data || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles({ company: user.company._id });
      setRoles(res.data.data || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.company = user.company._id;

      if (editRole) {
        await updateRole(editRole._id, values);
        message.success("Role updated successfully");
      } else {
        await createRole(values);
        message.success("Role created successfully");
      }

      form.resetFields();
      setModalOpen(false);
      setEditRole(null);
      fetchRoles();
    } catch (err) {
      handleError(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRole(id);
      fetchRoles();
      message.success("Role deleted");
    } catch (err) {
      handleError(err);
    }
  };

  const openEditModal = (role) => {
    setEditRole(role);
    form.setFieldsValue(role);
    setModalOpen(true);
  };

  const columns = [
    { title: "Role Name", dataIndex: "name" },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Assign Permission",
      width: 500,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {user?.role?.permissions.includes("assign.role") && (
            <>
              <Select
                mode="multiple"
                placeholder="Select permissions"
                value={
                  selectedPermissionsByRole[record._id] ||
                  (record.permissions
                    ? record.permissions.map((p) => (p._id ? p._id : p))
                    : [])
                }
                onChange={(vals) =>
                  setSelectedPermissionsByRole((prev) => ({
                    ...prev,
                    [record._id]: vals,
                  }))
                }
                style={{ flex: 1 }}
              >
                {permissions.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                onClick={async () => {
                  try {
                    const perms =
                      selectedPermissionsByRole[record._id] ||
                      (record.permissions
                        ? record.permissions.map((p) => (p._id ? p._id : p))
                        : []);
                    await assignPermissions(record._id, { permissions: perms });
                    message.success("Permissions assigned");
                    fetchRoles();
                  } catch (err) {
                    handleError(err);
                  }
                }}
              >
                Assign
              </Button>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          {user?.role?.permissions.includes("update.role") && (
            <Button type="link" onClick={() => openEditModal(record)}>
              Edit
            </Button>
          )}

          {user?.role?.permissions.includes("delete.role") && (
            <Popconfirm
              title="Delete this role?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <h2>Roles Management</h2>
        {user?.role?.permissions.includes("create.role") && (
          <Button
            type="primary"
            onClick={() => {
              setEditRole(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Add Role
          </Button>
        )}
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={roles}
        columns={columns}
        pagination={false}
      />

      <Modal
        title={editRole ? "Edit Role" : "Add Role"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Role Name"
            name="name"
            rules={[{ required: true, message: "Please enter role name" }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
