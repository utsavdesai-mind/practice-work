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
      await createRole({
        name: newRoleName,
        company: user.company._id,
      });
      message.success("Role created successfully");
      setNewRoleName("");
      setShowAddRole(false);
      await fetchRoles();
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
      await createDepartment({
        name: newDepartmentName,
        company: user.company._id,
      });
      message.success("Department created successfully");
      setNewDepartmentName("");
      setShowAddDepartment(false);
      await fetchDepartments();
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
        await updateUser(editData._id, values);
        message.success("User updated successfully");
      } else {
        await createUser(values);
        message.success("User created successfully");
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
      await deleteUser(id);
      await fetchUsers();
      message.success("User deleted successfully");
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
      render: (_, record) => (
        <Space>
          {user?.role?.permissions.includes("update.user") && (
            <Button type="link" onClick={() => openEditModal(record)}>
              Edit
            </Button>
          )}
          {user?.role?.permissions.includes("delete.user") && (
            <Popconfirm
              title="Are you sure to delete this user?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
    {
      title: "Invite User",
      render: (_, record) => (
        <>
          {user?.role?.permissions.includes("invite.user") && (
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
        <h2>User Management</h2>
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
        columns={columns}
        pagination={false}
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
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          {!editData && (
            <>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please input the email!" }]}
              >
                <Input type="email" placeholder="Enter your email" />
              </Form.Item>
            </>
          )}
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select placeholder="Select a role">
              {roles.map((role) => (
                <Select.Option key={role._id} value={role._id}>
                  {role.name}
                </Select.Option>
              ))}
              <Select.Option disabled>
                <div
                  style={{
                    padding: "8px 0",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 8,
                  }}
                >
                  <Button
                    type="text"
                    block
                    size="small"
                    onClick={() => setShowAddRole(true)}
                  >
                    + Add Role
                  </Button>
                </div>
              </Select.Option>
            </Select>
          </Form.Item>
          {showAddRole && (
            <div
              style={{
                padding: "12px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                marginBottom: "12px",
                backgroundColor: "#fafafa",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 4 }}>
                  New Role Name
                </label>
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
                  Create Role
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
          <Form.Item
            label="Department"
            name="department"
            rules={[{ required: true, message: "Please select a department!" }]}
          >
            <Select placeholder="Select a department">
              {departments.map((dept) => (
                <Select.Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Select.Option>
              ))}
              <Select.Option disabled>
                <div
                  style={{
                    padding: "8px 0",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 8,
                  }}
                >
                  <Button
                    type="text"
                    block
                    size="small"
                    onClick={() => setShowAddDepartment(true)}
                  >
                    + Add Department
                  </Button>
                </div>
              </Select.Option>
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
                <label style={{ display: "block", marginBottom: 4 }}>
                  New Department Name
                </label>
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
                  Create Department
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
        </Form>
      </Modal>
    </>
  );
}
