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
} from "../../api/userService";
import { getRoles } from "../../api/roleService";
import { getDepartments } from "../../api/departmentService";
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

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

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
          <Button type="link" onClick={() => openEditModal(record)}>
            Edit
          </Button>
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
        </Space>
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
            onChange={async (value) => {
              try {
                setLoading(true);
                const res = await getUsers({
                  company: user.company._id,
                  department: value,
                });
                setUsers(res.data.data);
              } catch (error) {
                handleError(error);
              } finally {
                setLoading(false);
              }
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
            onChange={async (value) => {
              try {
                setLoading(true);
                const res = await getUsers({
                  company: user.company._id,
                  role: value,
                });
                setUsers(res.data.data);
              } catch (error) {
                handleError(error);
              } finally {
                setLoading(false);
              }
            }}
          >
            {roles.map((role) => (
              <Select.Option key={role._id} value={role._id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
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
            <Input />
          </Form.Item>
          {!editData && (
            <>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please input the email!" }]}
              >
                <Input type="email" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: !editData,
                    message: "Please input the password!",
                  },
                ]}
              >
                <Input.Password />
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
            </Select>
          </Form.Item>
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
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
