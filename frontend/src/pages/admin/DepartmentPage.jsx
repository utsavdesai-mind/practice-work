import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/departmentService";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { handleError } from "../../utils/handleError";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export default function DepartmentPage() {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openModal = (data = null) => {
    setEditData(data);
    setVisible(true);
    form.setFieldsValue(data || { name: "", company: "" });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      values.company = user.company._id;

      if (editData) {
        const res = await updateDepartment(editData._id, values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        fetchDepartments();
        message.success(res.data.message);
      } else {
        const res = await createDepartment(values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        fetchDepartments();
        message.success(res.data.message);
      }

      setVisible(false);
      setEditData(null);
      form.resetFields();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteDepartment(id);
      if (res.data && !res.data.success) {
        message.error(res.data.message);
        return;
      }

      fetchDepartments();
      message.success(res.data.message);
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Company",
      dataIndex: "company",
      render: (c) => c?.name,
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      render: (user) => (user ? `${user.name} (${user.email})` : "N/A"),
    },
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
          {user?.role?.permissions.includes("update.dept") && (
            <Button
              primary
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          )}
          {user?.role?.permissions.includes("delete.dept") && (
            <Popconfirm
              title="Are you sure delete this department?"
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
  ];

  const filteredColumns = columns.filter((column) => {
    if (column.key === "actions") {
      return (
        user?.role?.permissions.includes("update.dept") ||
        user?.role?.permissions.includes("delete.dept")
      );
    }
    return true;
  });

  return (
    <div>
      {/* Filter by Company */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>Department Management</h2>
        {user?.role?.permissions.includes("create.dept") && (
          <Button type="primary" onClick={() => openModal()}>
            Add Department
          </Button>
        )}
      </div>

      {/* Table */}
      <Table
        loading={loading}
        dataSource={departments}
        rowKey="_id"
        columns={filteredColumns}
        pagination={false}
        scroll={{ y: 'calc(100vh - 200px)' }}
      />

      {/* Modal Form */}
      <Modal
        title={editData ? "Edit Department" : "Add Department"}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Department Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter department name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
