import { useEffect, useState, useContext } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  getCredentials,
  createCredential,
  updateCredential,
  deleteCredential,
  shareCredential,
} from "../../api/credentialsService";
import { getDepartments } from "../../api/departmentService";
import { AuthContext } from "../../context/AuthContext";
import { handleError } from "../../utils/handleError";
import useDebounce from "../../hooks/useDebounce";

export default function CredentialsPage() {
  const { user } = useContext(AuthContext);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [shareForm] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sharingId, setSharingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchTerm = useDebounce(searchText, 500);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchCredentials();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [selectedUser]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchCredentials();
    }
  }, [debouncedSearchTerm]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await getCredentials({
        company: user?.company?._id,
        userId: selectedUser,
        search: searchText,
      });
      setCredentials(res.data.data || []);
    } catch (err) {
      message.error("Failed to fetch credentials");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments({ company: user.company._id });
      setDepartments(res.data.data || []);
    } catch (err) {
      handleError(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editId) {
        await updateCredential(editId, values);
        message.success("Credential updated successfully!");
      } else {
        await createCredential({ company: user?.company?._id, ...values });
        message.success("Credential added successfully!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditId(null);
      fetchCredentials();
    } catch (err) {
      message.error("Validation failed!");
    }
  };

  const handleEdit = (record) => {
    setEditId(record._id);
    form.setFieldsValue({
      name: record.name,
      url: record.url,
      userName: record.userName,
      password: record.password,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCredential(id);
      message.success("Credential deleted!");
      fetchCredentials();
    } catch (err) {
      message.error("Delete failed!");
    }
  };

  const openShareModal = (record) => {
    setSharingId(record._id);
    shareForm.resetFields();
    setShareModalOpen(true);
  };

  const handleShare = async () => {
    try {
      console.log(sharingId);
      const values = await shareForm.validateFields();
      await shareCredential(sharingId, values);
      message.success("Credential shared successfully!");
      setShareModalOpen(false);
      setSharingId(null);
    } catch (err) {
      message.error("Share failed");
    }
  };

  const columns = [
    { title: "Owner Name", dataIndex: ["userId", "name"] },
    { title: "Owner Email", dataIndex: ["userId", "email"] },
    { title: "Credential Name", dataIndex: "name" },
    {
      title: "Credential URL",
      dataIndex: "url",
      render: (text) => (
        <a href={text} target="_blank" rel="noreferrer">
          {text}
        </a>
      ),
    },
    { title: "Credential Username", dataIndex: "userName" },
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
          {user?.role?.permissions.includes("update.credit") && (
            <Button type="link" onClick={() => handleEdit(record)}>
              Edit
            </Button>
          )}
          {user?.role?.permissions.includes("delete.credit") && (
            <Popconfirm
              title="Are you sure to delete this credential?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
          {user?.role?.permissions.includes("share.credit") && (
            <Button type="link" onClick={() => openShareModal(record)}>
              Share
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredColumns = columns.filter(
    (col) =>
      col.title !== "Actions" ||
      user?.role?.permissions.includes("update.credit") ||
      user?.role?.permissions.includes("delete.credit") ||
      user?.role?.permissions.includes("share.credit")
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2>Credentials</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <Input
            placeholder="Search by name or URL..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Filter by User"
            allowClear
            value={selectedUser}
            onChange={setSelectedUser}
            style={{ width: 250 }}
            options={[
              ...new Map(
                credentials.map((c) => [
                  c.userId._id,
                  { label: c.userId.name, value: c.userId._id },
                ])
              ).values(),
            ]}
          />
          {user?.role?.permissions.includes("create.credit") && (
            <Button
              type="primary"
              onClick={() => {
                setEditId(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Add Credential
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={filteredColumns}
        dataSource={credentials}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editId ? "Edit Credential" : "Add Credential"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        onOk={handleSubmit}
        okText={editId ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            name="userName"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Share Credential"
        open={shareModalOpen}
        onCancel={() => {
          setShareModalOpen(false);
          setSharingId(null);
        }}
        onOk={handleShare}
      >
        <Form form={shareForm} layout="vertical">
          <Form.Item
            name="email"
            label="Handle My Email"
            rules={[{ type: "email", message: "Please enter a valid email" }]}
          >
            <Input placeholder="Recipient email (optional)" />
          </Form.Item>

          <Form.Item name="department" label="Handle By Department">
            <Select placeholder="Select department" allowClear>
              {departments.map((d) => (
                <Select.Option key={d._id} value={d._id}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
