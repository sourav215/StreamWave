import ProtectedRoute from "@/components/ProtectedRoute";
import React from "react";

const About = () => {
  return (
    <ProtectedRoute>
      <div>About</div>
    </ProtectedRoute>
  );
};

export default About;
