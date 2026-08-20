"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, Calendar, Activity, MessageCircle, FileText } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
}

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/api/patients/${id}`);
        if (res.data.success) {
          setPatient(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch patient:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading patient profile...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center text-slate-500">Patient not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              {patient.firstName} {patient.lastName}
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Patient ID: {patient._id.slice(-6).toUpperCase()} • Joined {new Date(patient.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-200 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-primary">
            <MessageCircle className="w-4 h-4 mr-2" /> Message
          </Button>
          <Button className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl shadow-sm shadow-blue-500/20">
            <Calendar className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl overflow-hidden">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-sm flex items-center justify-center -mt-10 mb-4 mx-auto">
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {patient.phone}
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {patient.email}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  {patient.gender || "Not specified"} • {patient.bloodGroup || "Blood Group N/A"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-primary" /> Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medicalHistory ? (
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {patient.medicalHistory}
                </p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400 mb-3">No medical history recorded.</p>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Add History
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Appointments & Activity */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl h-full">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-800">Recent Appointments</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-primary hover:bg-blue-50">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-700 font-medium mb-1">No appointments yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-4">
                  This patient hasn't booked any appointments or treatments yet.
                </p>
                <Button className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl shadow-sm">
                  Book First Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
