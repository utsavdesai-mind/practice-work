import { useContext, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Checkbox,
  Empty,
  Spin,
  Tag,
  Space,
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
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export default function RolePage() {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionSearchText, setPermissionSearchText] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [form] = Form.useForm();

  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const res = await getPermissions();

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoadingPermissions(false);
        return;
      }

      setPermissions(res.data.data || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles({ company: user.company._id });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoading(false);
        return;
      }

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
        const res = await updateRole(editRole._id, values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      } else {
        const res = await createRole(values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
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
      const res = await deleteRole(id);

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      fetchRoles();
      message.success(res.data.message);
    } catch (err) {
      handleError(err);
    }
  };

  const openEditModal = (role) => {
    setEditRole(role);
    form.setFieldsValue(role);
    setModalOpen(true);
  };

  // Open permission assignment modal
  const openPermissionModal = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(
      role.permissions ? role.permissions.map((p) => (p._id ? p._id : p)) : []
    );
    setPermissionSearchText("");
    setPermissionModalOpen(true);
  };

  const getPermissionsByModule = () => {
    let filtered;
    if (permissionSearchText.trim() === "") {
      filtered = permissions;
    } else {
      const filteredSet = new Set(
        permissions
          .filter((p) =>
            p.label.toLowerCase().includes(permissionSearchText.toLowerCase())
          )
          .map((p) => p._id)
      );
      filtered = permissions.filter(
        (p) =>
          filteredSet.has(p._id) || selectedPermissions.includes(p._id)
      );
    }
    const grouped = {};
    filtered.forEach((perm) => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    });
    return grouped;
  };

  // Handle permission assignment
  const handlePermissionAssign = async () => {
    try {
      setLoadingPermissions(true);
      const res = await assignPermissions(selectedRole._id, {
        permissions: selectedPermissions,
      });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoadingPermissions(false);
        return;
      }

      message.success(res.data.message);
      setPermissionModalOpen(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
      setPermissionSearchText("");
      fetchRoles();
    } catch (err) {
      handleError(err);
    } finally {
      setLoadingPermissions(false);
    }
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
      key: "assignPermission",
      width: 500,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div>
            {record.permissions.map((permission) => (
              <Tag
                key={permission._id}
                color="blue"
                style={{ margin: "5px 5px 0px 0px" }}
              >
                {permission.label}
              </Tag>
            ))}
          </div>
          <div>
            <Button
              type="primary"
              size="small"
              onClick={() => openPermissionModal(record)}
            >
              Manage Permissions
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {user?.role?.permissions.includes("update.role") && (
            <Button
              primary
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          )}
          {user?.role?.permissions.includes("delete.role") && (
            <Popconfirm
              title="Delete this role?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record._id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredColumns = columns.filter((column) => {
    if (column.key === "assignPermission") {
      return user?.role?.permissions.includes("assign.role");
    }
    if (column.key === "actions") {
      return (
        user?.role?.permissions.includes("update.role") ||
        user?.role?.permissions.includes("delete.role")
      );
    }
    return true;
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>Roles Management</h2>
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
        columns={filteredColumns}
        pagination={false}
        scroll={{ y: 'calc(100vh - 200px)' }}
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

      {/* Permission Assignment Modal */}
      <Modal
        title={`Assign Permissions to ${selectedRole?.name || ""}`}
        open={permissionModalOpen}
        onCancel={() => {
          setPermissionModalOpen(false);
          setSelectedRole(null);
          setSelectedPermissions([]);
          setPermissionSearchText("");
        }}
        onOk={handlePermissionAssign}
        okText="Save Permissions"
        width={700}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        confirmLoading={loadingPermissions}
      >
        <Spin spinning={loadingPermissions}>
          <Input
            placeholder="Search permissions by name..."
            value={permissionSearchText}
            onChange={(e) => setPermissionSearchText(e.target.value)}
            style={{ marginBottom: 20 }}
            allowClear
          />
          <Checkbox.Group
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
            value={selectedPermissions}
            onChange={(vals) => setSelectedPermissions(vals)}
          >
            {Object.keys(getPermissionsByModule()).length > 0 ? (
              Object.entries(getPermissionsByModule()).map(
                ([module, perms], index) => (
                  <div key={module}>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1677ff",
                        marginTop: index === 0 ? 0 : 16,
                        marginBottom: 12,
                      }}
                    >
                      📦 {module}
                    </h4>
                    <div
                      style={{
                        marginLeft: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {perms.map((perm) => (
                        <Checkbox key={perm._id} value={perm._id}>
                          <span style={{ fontSize: "13px" }}>
                            {perm.label}
                            <span style={{ color: "#999", fontSize: "11px" }}>
                              {" "}
                              ({perm.key})
                            </span>
                          </span>
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                )
              )
            ) : (
              <Empty
                description={
                  permissionSearchText
                    ? "No permissions found"
                    : "No permissions available"
                }
                style={{ marginTop: 20 }}
              />
            )}
          </Checkbox.Group>
        </Spin>
      </Modal>
    </>
  );
}
