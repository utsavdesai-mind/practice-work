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
import { useSyncPermissions } from "../../hooks/useSyncPermissions";

export default function DepartmentPage() {
  const { user } = useContext(AuthContext);
  useSyncPermissions();
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      values.company = user.company._id;

      if (editData) {
        const res = await updateDepartment(editData._id, values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      } else {
        const res = await createDepartment(values);
        if (res.data && !res.data.success) {
          message.error(res.data.message);
          return;
        }

        message.success(res.data.message);
      }

      form.resetFields();
      setVisible(false);
      setEditData(null);
      fetchDepartments();
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

  const openEditModal = (record) => {
    setEditData(record);
    form.setFieldsValue(record);
    setVisible(true);
  };

  const columns = [
    { title: "Department Name", dataIndex: "name" },
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
          {user?.permissions.includes("update.dept") && (
            <Button
              primary
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          )}
          {user?.permissions.includes("delete.dept") && (
            <Popconfirm
              title="Delete this department?"
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
    if (column.key === "actions") {
      return (
        user?.permissions.includes("update.dept") ||
        user?.permissions.includes("delete.dept")
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
        <h2 style={{ fontWeight: "bold" }}>Department Management</h2>
        {user?.permissions.includes("create.dept") && (
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setVisible(true);
            }}
          >
            Add Department
          </Button>
        )}
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={departments}
        columns={filteredColumns}
        pagination={false}
        scroll={{ y: 'calc(100vh - 200px)' }}
      />

      <Modal
        title={editData ? "Edit Department" : "Add Department"}
        open={visible}
        onCancel={() => {
          setVisible(false);
          setEditData(null);
        }}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Department Name"
            name="name"
            rules={[{ required: true, message: "Please enter department name" }]}
          >
            <Input placeholder="Enter department name" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
