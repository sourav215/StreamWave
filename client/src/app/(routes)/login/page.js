"use client";

import React from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useLoginUserMutation } from "@/store/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();

  const [loginUser, { isLoading }] = useLoginUserMutation();

  const onFinish = async (values) => {
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      }).unwrap();

      // Store user and accessToken in Redux
      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.accessToken,
        })
      );

      message.success("Login successful!");
      router.push("/");
    } catch (error) {
      message.error(
        error?.data?.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-blue-50 to-indigo-100 px-4">
      <Card
        className="w-full max-w-md shadow-2xl"
        style={{ borderRadius: "12px" }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="mb-2">
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to continue to Stream Wave</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
          className="compact-form"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              className="h-12 text-base font-semibold"
            >
              Sign In
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text type="secondary">
              Don&apos;t have an account?{" "}
              <Button
                type="link"
                onClick={() => router.push("/signup")}
                className="p-0"
              >
                Sign Up
              </Button>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}
