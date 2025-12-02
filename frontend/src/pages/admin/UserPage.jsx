import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Space,
  message,
  Popconfirm,
  Form,
  Select,
  Tag,
} from "antd";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  inviteUser,
} from "../../api/userService";
import { getRoles, createRole } from "../../api/roleService";
import { getDepartments, createDepartment } from "../../api/departmentService";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { handleError } from "../../utils/handleError";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export default function UserPage() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const [creatingDepartment, setCreatingDepartment] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles({ company: user.company._id });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoading(false);
        return;
      }

      setRoles(res.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartments({ company: user.company._id });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoading(false);
        return;
      }

      setDepartments(res.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers({ company: user.company._id });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoading(false);
        return;
      }

      setUsers(res.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async (department, role) => {
    try {
      setLoading(true);
      const filterParams = { company: user.company._id };

      if (department) filterParams.department = department;
      if (role) filterParams.role = role;

      const res = await getUsers(filterParams);

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoading(false);
        return;
      }

      setUsers(res.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      message.error("Please enter a role name");
      return;
    }

    try {
      setCreatingRole(true);
      const res = await createRole({
        name: newRoleName,
        company: user.company._id,
      });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      message.success(res.data.message);
      setNewRoleName("");
      setShowAddRole(false);
      fetchRoles();
    } catch (error) {
      handleError(error);
    } finally {
      setCreatingRole(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) {
      message.error("Please enter a department name");
      return;
    }

    try {
      setCreatingDepartment(true);
      const res = await createDepartment({
        name: newDepartmentName,
        company: user.company._id,
      });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      message.success(res.data.message);
      setNewDepartmentName("");
      setShowAddDepartment(false);
      fetchDepartments();
    } catch (error) {
      handleError(error);
    } finally {
      setCreatingDepartment(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.company = user.company._id;

      if (editData) {
        const res = await updateUser(editData._id, values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      } else {
        const res = await createUser(values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      }

      form.resetFields();
      setModalOpen(false);
      setEditData(null);
      fetchUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteUser(id);
      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      fetchUsers();
      message.success(res.data.message);
    } catch (error) {
      handleError(error);
    }
  };

  const openEditModal = (record) => {
    setEditData(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Company", dataIndex: ["company", "name"] },
    { title: "Department", dataIndex: ["department", "name"] },
    { title: "Role", dataIndex: ["role", "name"] },
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {user?.role?.permissions.includes("update.user") && (
            <Button
              primary
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          )}
          {user?.role?.permissions.includes("delete.user") && (
            <Popconfirm
              title="Are you sure to delete this user?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
    {
      title: "Invite User",
      key: "inviteUser",
      render: (_, record) =>
        record.isAccepted === true ? (
          <Tag style={{ padding: "0 15px" }} color="blue">
            Already Accepted
          </Tag>
        ) : (
          <Button
            type="primary"
            onClick={async () => {
              try {
                setLoading(true);
                const res = await inviteUser(record._id);
                const invitationLink = res.data.data.invitationLink;
                const invitationOTP = res.data.data.otp;
                window.open(invitationLink, "_blank");
                navigator.clipboard.writeText(invitationOTP);
                message.success("Invitation sent successfully");
              } catch (error) {
                handleError(error);
              } finally {
                setLoading(false);
              }
            }}
          >
            Send Invitation
          </Button>
        ),
    },
  ];

  const filteredColumns = columns.filter((column) => {
    if (column.key === "inviteUser") {
      return user?.role?.permissions.includes("invite.user");
    }
    if (column.key === "actions") {
      return (
        user?.role?.permissions.includes("update.user") ||
        user?.role?.permissions.includes("delete.user")
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
        <h2 style={{ fontWeight: "bold" }}>User Management</h2>
        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <Select
            style={{ width: 200, marginRight: 10 }}
            placeholder="Filter by Department"
            allowClear
            onChange={(value) => {
              setSelectedDepartment(value);
              applyFilters(value, selectedRole);
            }}
          >
            {departments.map((dept) => (
              <Select.Option key={dept._id} value={dept._id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            style={{ width: 200, marginRight: 10 }}
            placeholder="Filter by Role"
            allowClear
            onChange={(value) => {
              setSelectedRole(value);
              applyFilters(selectedDepartment, value);
            }}
          >
            {roles.map((role) => (
              <Select.Option key={role._id} value={role._id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
          {user?.role?.permissions.includes("create.user") && (
            <Button
              type="primary"
              onClick={() => {
                setEditData(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Add User
            </Button>
          )}
        </div>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={users}
        columns={filteredColumns}
        pagination={false}
        scroll={{ y: 'calc(100vh - 200px)' }}
      />

      <Modal
        title={editData ? "Edit User" : "Add User"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: "8px" }}>
            <label>
              <span style={{ color: "red" }}>*</span> Name
            </label>
          </div>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          {!editData && (
            <>
              <div style={{ marginBottom: "8px" }}>
                <label>
                  <span style={{ color: "red" }}>*</span> Email
                </label>
              </div>
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Please input the email!" }]}
              >
                <Input type="email" placeholder="Enter your email" />
              </Form.Item>
            </>
          )}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label>
                <span style={{ color: "red" }}>*</span> Role
              </label>
              {user?.role?.permissions.includes("create.role") && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => setShowAddRole(!showAddRole)}
                  style={{ padding: "0" }}
                >
                  + Add Role
                </Button>
              )}
            </div>
            <Form.Item
              name="role"
              rules={[{ required: true, message: "Please select a role!" }]}
              style={{ marginBottom: "8px" }}
            >
              <Select
                placeholder="Search and select a role"
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? "").includes(
                    input.toLowerCase()
                  )
                }
                optionLabelProp="children"
                style={{
                  maxHeight: "300px",
                }}
                listHeight={200}
              >
                {roles.map((role) => (
                  <Select.Option key={role._id} value={role._id}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {showAddRole && (
              <div
                style={{
                  padding: "12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="Enter role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateRole();
                      }
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="primary"
                    size="small"
                    loading={creatingRole}
                    onClick={handleCreateRole}
                  >
                    Create
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setShowAddRole(false);
                      setNewRoleName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label>
                <span style={{ color: "red" }}>*</span> Department
              </label>
              {user?.role?.permissions.includes("create.dept") && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => setShowAddDepartment(!showAddDepartment)}
                  style={{ padding: "0" }}
                >
                  + Add Department
                </Button>
              )}
            </div>
            <Form.Item
              name="department"
              rules={[
                { required: true, message: "Please select a department!" },
              ]}
              style={{ marginBottom: "8px" }}
            >
              <Select
                placeholder="Search and select a department"
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? "").includes(
                    input.toLowerCase()
                  )
                }
                optionLabelProp="children"
                style={{
                  maxHeight: "300px",
                }}
                listHeight={200}
              >
                {departments.map((dept) => (
                  <Select.Option key={dept._id} value={dept._id}>
                    {dept.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {showAddDepartment && (
              <div
                style={{
                  padding: "12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "4px",
                  backgroundColor: "#fafafa",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="Enter department name"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    size="small"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateDepartment();
                      }
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="primary"
                    size="small"
                    loading={creatingDepartment}
                    onClick={handleCreateDepartment}
                  >
                    Create
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setShowAddDepartment(false);
                      setNewDepartmentName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
}
