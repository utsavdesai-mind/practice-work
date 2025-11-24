import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from "antd";
import {
    getCompanies,
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} from "../../api/departmentService";

const { Option } = Select;

export default function DepartmentPage() {
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [form] = Form.useForm();

    const fetchCompanies = async () => {
        const res = await getCompanies();
        setCompanies(res.data.data);
    };

    const fetchDepartments = async (companyId = "") => {
        setLoading(true);
        try {
            const res = await getDepartments(companyId ? { company: companyId } : {});
            setDepartments(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchDepartments();
    }, []);

    const openModal = (data = null) => {
        setEditData(data);
        setVisible(true);
        form.setFieldsValue(data || { name: "", company: "" });
    };

    const handleSave = async () => {
        const values = await form.validateFields();

        if (editData) {
            await updateDepartment(editData._id, values);
            message.success("Department updated successfully");
        } else {
            await createDepartment(values);
            message.success("Department created successfully");
        }

        setVisible(false);
        setEditData(null);
        form.resetFields();
        fetchDepartments(selectedCompany);
    };

    const handleDelete = async (id) => {
        await deleteDepartment(id);
        message.success("Department deleted");
        fetchDepartments(selectedCompany);
    };

    const columns = [
        { title: "Name", dataIndex: "name" },
        {
            title: "Company",
            dataIndex: "company",
            render: (c) => c?.name
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            render: (user) => user ? `${user.name} (${user.email})` : "N/A"
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
                <Space>
                    <Button type="link" onClick={() => openModal(record)}>
                        Edit
                    </Button>
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
                </Space>
            )
        }
    ]

    return (
        <div>

            {/* Filter by Company */}
            <div style={{ marginBottom: 20, display: "flex", gap: 10, justifyContent: "space-between" }}>
                <h2>Department Management</h2>
                <div style={{
                    display: "flex",
                    gap: "20px"
                }}>
                    <Select
                        placeholder="Filter By Company"
                        allowClear
                        style={{ width: 250 }}
                        onChange={(value) => {
                            setSelectedCompany(value || null);
                            fetchDepartments(value || "");
                        }}
                    >
                        {companies.map((company) => (
                            <Option key={company._id} value={company._id}>
                                {company.name}
                            </Option>
                        ))}
                    </Select>

                    <Button type="primary" onClick={() => openModal()}>
                        Add Department
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Table
                loading={loading}
                dataSource={departments}
                rowKey="_id"
                columns={columns}
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

                    <Form.Item
                        label="Company"
                        name="company"
                        rules={[{ required: true, message: "Please select company" }]}
                    >
                        <Select placeholder="Select Company">
                            {companies.map((c) => (
                                <Option key={c._id} value={c._id}>
                                    {c.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
