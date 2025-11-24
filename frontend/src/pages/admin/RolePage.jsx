import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm, message } from "antd";
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole
} from "../../api/roleService";
import { handleError } from "../../utils/handleError";

export default function RolePage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [form] = Form.useForm();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await getRoles();
            setRoles(res.data.data || []);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editRole) {
                await updateRole(editRole._id, values);
                message.success("Role updated successfully");
            } else {
                await createRole(values);
                message.success("Role created successfully");
            }

            form.resetFields();
            setModalOpen(false);
            setEditRole(null);
            fetchRoles();

        } catch (err) {
            handleError(err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteRole(id);
            message.success("Role deleted");
            fetchRoles();
        } catch (err) {
            handleError(err);
        }
    };

    const openEditModal = (role) => {
        setEditRole(role);
        form.setFieldsValue(role);
        setModalOpen(true);
    };

    const columns = [
        { title: "Role Name", dataIndex: "name" },
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
                    <Button type="link" onClick={() => openEditModal(record)}>
                        Edit
                    </Button>

                    <Popconfirm
                        title="Delete this role?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(record._id)}
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </>
            )
        },
    ]

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                <h2>Roles Management</h2>
                <Button type="primary" onClick={() => { setEditRole(null); form.resetFields(); setModalOpen(true); }}>
                    Add Role
                </Button>
            </div>

            <Table
                rowKey="_id"
                loading={loading}
                dataSource={roles}
                columns={columns}
                pagination={false}
            />

            <Modal
                title={editRole ? "Edit Role" : "Add Role"}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Role Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter role name" }]}
                    >
                        <Input placeholder="Enter role name" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
