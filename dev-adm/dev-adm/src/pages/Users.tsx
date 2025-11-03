"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Users as UsersIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  country?: string;
  createdAt?: { seconds: number };
};

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(1000)
        );
        const querySnapshot = await getDocs(q);
        const userData: User[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Fetch Failed",
          description: "Unable to fetch users. Try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const formatDate = (timestamp?: { seconds: number }) => {
    if (!timestamp?.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const downloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        users.map((user) => ({
          Name: user.name || "No Name",
          Email: user.email || "",
          Phone: user.phone || "",
          Address: user.address || "",
          City: user.city || "",
          Pincode: user.pincode || "",
          Country: user.country || "",
          "Joined Date": formatDate(user.createdAt),
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(data, `users_export_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Users data has been exported to Excel file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            View and manage user accounts
          </p>
        </div>
        <Button
          onClick={downloadExcel}
          disabled={loading || users.length === 0}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Users Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            User Directory ({loading ? "..." : users.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold">City</TableHead>
                  <TableHead className="font-semibold">Pincode</TableHead>
                  <TableHead className="font-semibold">Country</TableHead>
                  <TableHead className="font-semibold">Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="border-border/50 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">
                        {user.name || "No Name"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={user.address}
                      >
                        {user.address}
                      </TableCell>
                      <TableCell>{user.city}</TableCell>
                      <TableCell>{user.pincode}</TableCell>
                      <TableCell>{user.country}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {users.length}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {new Set(users.map((u) => u.country)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Latest Join
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-warning">
                {formatDate(
                  users.reduce((latest, u) =>
                    u.createdAt &&
                    (!latest || u.createdAt.seconds > latest.seconds)
                      ? u.createdAt
                      : latest,
                  undefined as User["createdAt"])
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
