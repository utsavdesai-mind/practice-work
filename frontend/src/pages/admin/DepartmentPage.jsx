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

export default function DepartmentPage() {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const fetchDepartments = async (companyId = "") => {
    setLoading(true);
    try {
      const res = await getDepartments({ company: companyId });
      setDepartments(res.data.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(user.company._id);
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
        await updateDepartment(editData._id, values);
        await fetchDepartments(user.company._id);
        message.success("Department updated successfully");
      } else {
        await createDepartment(values);
        await fetchDepartments(user.company._id);
        message.success("Department created successfully");
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
      await deleteDepartment(id);
      await fetchDepartments(user.company._id);
      message.success("Department deleted");
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
            <Button type="link" onClick={() => openModal(record)}>
              Edit
            </Button>
          )}
          {user?.role?.permissions.includes("delete.dept") && (
            <Popconfirm
              title="Are you sure delete this department?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger type="link">
                Delete
              </Button>
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
        <h2>Department Management</h2>
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
