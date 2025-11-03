import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Folder } from "lucide-react";
import { useWebflow } from "@/context/WebflowContext";

export default function CategoryDashboard() {
  const { webflowData, updateCategories, createWebflowDoc, loading } = useWebflow();
  const [input, setInput] = useState("");
  const [emoji, setEmoji] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        Loading categories...
      </div>
    );
  }

  if (!webflowData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-muted-foreground">
          No Webflow data found. Create one to begin managing categories.
        </p>
        <button
          onClick={createWebflowDoc}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
        >
          <PlusCircle size={18} /> Create Webflow Document
        </button>
      </div>
    );
  }

  const categories = webflowData.categories || [];

  const addCategory = () => {
    const name = input.trim();
    if (!name) return;

    const newCategory = { name, icon: emoji || "📦" };
    updateCategories([...categories, newCategory]);
    setInput("");
    setEmoji("");
  };

  const deleteCategory = (index: number) => {
    const updated = categories.filter((_, i) => i !== index);
    updateCategories(updated);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Category Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Add, organize, and manage your product categories.
        </p>
      </div>

      {/* Add Category Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl">Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCategory();
            }}
            className="flex flex-wrap gap-3"
          >
            <input
              type="text"
              placeholder="Category name"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Emoji (optional)"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
            >
              <PlusCircle size={18} /> Add
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <Card
            key={idx}
            className="glass-card hover:scale-105 transition-transform duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {cat.icon} {cat.name}
              </CardTitle>
              <button
                onClick={() => deleteCategory(idx)}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <Trash2 size={18} />
              </button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Folder className="h-5 w-5" />
                Category {idx + 1}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
