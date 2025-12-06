"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Space } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import {
  useRegisterUserMutation,
  useVerifyOtpMutation,
} from "@/store/api/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

const { Title, Text } = Typography;

export default function SignupPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(2); // 1: registration, 2: OTP verification
  const [registrationData, setRegistrationData] = useState(null);

  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const onRegisterSubmit = async (values) => {
    try {
      await registerUser({
        email: values.email,
        name: values.name,
      }).unwrap();

      setRegistrationData({
        email: values.email,
        name: values.name,
        password: values.password,
      });
      setStep(2);
      message.success("OTP sent to your email!");
    } catch (error) {
      message.error(
        error?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  const onOtpSubmit = async (values) => {
    try {
      await verifyOtp({
        email: registrationData.email,
        name: registrationData.name,
        password: registrationData.password,
        otp: values.otp,
      }).unwrap();

      message.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (error) {
      message.error(
        error?.data?.message || "OTP verification failed. Please try again."
      );
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    form.setFieldsValue({ otp: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center from-blue-50 to-indigo-100 px-4">
      <Card
        className="w-full max-w-md shadow-2xl"
        style={{ borderRadius: "12px" }}
      >
        <div className="text-center mb-8">
          <Title level={2} className="mb-2">
            {step === 1 ? "Create Account" : "Verify OTP"}
          </Title>
          <Text type="secondary">
            {step === 1
              ? "Sign up to get started with Stream Wave"
              : "Enter the 4-digit OTP sent to your email"}
          </Text>
        </div>

        {step === 1 ? (
          <Form
            form={form}
            name="register"
            onFinish={onRegisterSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
            className="compact-form"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Please enter your name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your full name"
              />
            </Form.Item>

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
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
              hasFeedback
              style={{ marginBottom: "40px" }}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isRegistering}
              >
                Send OTP
              </Button>
            </Form.Item>

            <div className="text-center">
              <Text type="secondary">
                Already have an account?{" "}
                <Button
                  type="link"
                  onClick={() => router.push("/login")}
                  className="p-0"
                >
                  Sign In
                </Button>
              </Text>
            </div>
          </Form>
        ) : (
          <Form
            form={form}
            name="otp"
            onFinish={onOtpSubmit}
            size="large"
            requiredMark={false}
            style={{alignContent:"center", }}
          >
            <Form.Item
              name="otp"
              rules={[
                { required: true, message: "Please enter the OTP" },
                { len: 4, message: "OTP must be 4 digits" },
              ]}
              className="flex justify-center"
            >
              <Input.OTP
                placeholder="0000"
                maxLength={4}
                length={4}
                onChange={handleOtpChange}
                className="text-center text-2xl tracking-widest font-mono"
                style={{ letterSpacing: "0.5em" }}
              />
            </Form.Item>

            <Form.Item>
              <Space  className="w-full flex justify-center" size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={isVerifying}
                  className="h-12 text-base font-semibold"
                >
                  Verify OTP
                </Button>
                <Button
                  block
                  onClick={() => {
                    setStep(1);
                    form.resetFields();
                  }}
                >
                  Back
                </Button>
              </Space>
            </Form.Item>

            <div className="text-center">
              <Text type="secondary" className="text-sm">
                OTP sent to: {registrationData?.email}
              </Text>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
