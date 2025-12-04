import { useEffect, useState, useContext, useRef } from "react";
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
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { CSVLink } from "react-csv";
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
import { getUsers } from "../../api/userService";
import { useSyncPermissions } from "../../hooks/useSyncPermissions";

export default function CredentialsPage() {
  useSyncPermissions();
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
  const [users, setUsers] = useState([]);
  const csvLinkRef = useRef();

  useEffect(() => {
    user?.permissions.includes("get.user") && fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [selectedUser]);

  useEffect(() => {
    if (debouncedSearchTerm === "") {
      fetchCredentials();
    } else if (debouncedSearchTerm.length > 0) {
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

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        setLoading(false);
        return;
      }

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

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      setDepartments(res.data.data || []);
    } catch (err) {
      handleError(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers({ company: user.company._id });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      setUsers(res.data.data || []);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editId) {
        const res = await updateCredential(editId, values);

        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      } else {
        const res = await createCredential({
          company: user?.company?._id,
          ...values,
        });

        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      }

      setModalOpen(false);
      form.resetFields();
      setEditId(null);
      fetchCredentials();
    } catch (err) {
      handleError(err);
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
      const res = await deleteCredential(id);

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      message.success(res.data.message);
      fetchCredentials();
    } catch (err) {
      handleError(err);
    }
  };

  const openShareModal = (record) => {
    setSharingId(record._id);
    shareForm.resetFields();
    setShareModalOpen(true);
  };

  const handleShare = async () => {
    try {
      const values = await shareForm.validateFields();
      const res = await shareCredential(sharingId, {
        company: user.company._id,
        ...values,
      });

      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      message.success(res.data.message);
      setShareModalOpen(false);
      setSharingId(null);
    } catch (err) {
      handleError(err);
    }
  };

  const handleExport = () => {
    if (credentials.length === 0) {
      message.warning("No credentials to export");
      return;
    }

    csvLinkRef.current?.link?.click();
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
          {user?.permissions.includes("update.credit") && (
            <Button
              primary
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {user?.permissions.includes("delete.credit") && (
            <Popconfirm
              title="Are you sure to delete this credential?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
          {user?.permissions.includes("share.credit") && (
            <Button
              primary
              icon={<ShareAltOutlined />}
              onClick={() => openShareModal(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  const filteredColumns = columns.filter(
    (col) =>
      col.title !== "Actions" ||
      user?.permissions.includes("update.credit") ||
      user?.permissions.includes("delete.credit") ||
      user?.permissions.includes("share.credit")
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
        <h2 style={{ fontWeight: "bold" }}>Credentials Management</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <Input
            placeholder="Search by name or URL..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {user?.permissions.includes("get.user") && (
          <Select
            placeholder="Filter by User"
            allowClear
            value={selectedUser}
            onChange={setSelectedUser}
            style={{ width: 250 }}
          >
            {users.map((user) => (
              <Select.Option key={user._id} value={user._id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
          )}
          {user?.permissions.includes("export.credit") && (
            <>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                Export Credentials
              </Button>
              <CSVLink
                ref={csvLinkRef}
                data={credentials.map((credential) => ({
                  "Owner Name": credential.userId?.name || "",
                  "Owner Email": credential.userId?.email || "",
                  "Credential Name": credential.name,
                  "Credential URL": credential.url,
                  "Username": credential.userName,
                  "Password": credential.password,
                  "Created At": new Date(
                    credential.createdAt
                  ).toLocaleDateString(),
                  "Updated At": new Date(
                    credential.updatedAt
                  ).toLocaleDateString(),
                }))}
                filename={`credentials-${
                  new Date().toISOString().split("T")[0]
                }.csv`}
                style={{ display: "none" }}
              />
            </>
          )}
          {user?.permissions.includes("create.credit") && (
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
        scroll={{ y: "calc(100vh - 200px)" }}
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
