import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../api/companyService";

export default function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      setCompanies(res.data.data || []);
    } catch (err) {
      message.error("Failed to fetch companies");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editId) {
        await updateCompany(editId, values);
        message.success("Company updated successfully!");
      } else {
        await createCompany(values);
        message.success("Company added successfully!");
      }

      setModalOpen(false);
      form.resetFields();
      setEditId(null);
      fetchCompanies();
    } catch (err) {
      message.error("Validation failed!");
    }
  };

  const handleEdit = (record) => {
    setEditId(record._id);
    form.setFieldsValue({ name: record.name });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCompany(id);
      message.success("Company deleted!");
      fetchCompanies();
    } catch (err) {
      message.error("Delete failed!");
    }
  };

  const columns = [
    {
      title: "Company Name",
      dataIndex: "name",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      render: (text, record) => record.createdBy?.name || "N/A",
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
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure delete this company with all associated data?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="link">
              Delete
            </Button>
          </Popconfirm>
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
          marginBottom: 20,
        }}
      >
        <h2>Company Management</h2>
        <Button
          type="primary"
          onClick={() => {
            setModalOpen(true);
            form.resetFields();
          }}
        >
          Add Company
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={companies}
        rowKey="_id"
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editId ? "Edit Company" : "Add Company"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditId(null);
        }}
        onOk={handleSubmit}
        okText={editId ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Company Name"
            name="name"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
