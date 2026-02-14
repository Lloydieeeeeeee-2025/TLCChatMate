// app/api/admin/departments/route.js
import { chatmate } from "../../../../../library/tlcchatmatedb/route";

//
export async function GET(request) {
    try {
        const [departments] = await chatmate.execute(
            "SELECT department_id, department_name, created_at, updated_at FROM departments ORDER BY department_name ASC"
        );

        return Response.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return Response.json(
            { success: false, message: "Failed to fetch departments" },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const { department_name } = await request.json();

        // Validate input
        if (!department_name || department_name.trim() === "") {
            return Response.json(
                { success: false, message: "Department name is required" },
                { status: 400 }
            );
        }

        if (department_name.length > 255) {
            return Response.json(
                { success: false, message: "Department name must be 255 characters or less" },
                { status: 400 }
            );
        }

        const trimmedDepartmentName = department_name.trim();

        // Check if department already exists
        const [existing] = await chatmate.execute(
            "SELECT department_id FROM departments WHERE LOWER(department_name) = LOWER(?)",
            [trimmedDepartmentName]
        );

        if (existing.length > 0) {
            return Response.json(
                { success: false, message: "Department already exists" },
                { status: 409 }
            );
        }

        // Insert new department
        const [result] = await chatmate.execute(
            "INSERT INTO departments (department_name) VALUES (?)",
            [trimmedDepartmentName]
        );

        return Response.json({
            success: true,
            message: "Department created successfully",
            data: {
                department_id: result.insertId,
                department_name: trimmedDepartmentName
            }
        });

    } catch (error) {
        console.error("Error creating department:", error);
        return Response.json(
            { success: false, message: "Failed to create department" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { department_id, department_name } = await request.json();

        if (!department_id || !department_name || department_name.trim() === "") {
            return Response.json(
                { success: false, message: "Department ID and name are required" },
                { status: 400 }
            );
        }

        if (department_name.length > 255) {
            return Response.json(
                { success: false, message: "Department name must be 255 characters or less" },
                { status: 400 }
            );
        }

        const trimmedDepartmentName = department_name.trim();

        // Check if department exists
        const [existing] = await chatmate.execute(
            "SELECT department_id FROM departments WHERE department_id = ?",
            [department_id]
        );

        if (existing.length === 0) {
            return Response.json(
                { success: false, message: "Department not found" },
                { status: 404 }
            );
        }

        // Check for duplicate (excluding current)
        const [duplicate] = await chatmate.execute(
            "SELECT department_id FROM departments WHERE LOWER(department_name) = LOWER(?) AND department_id != ?",
            [trimmedDepartmentName, department_id]
        );

        if (duplicate.length > 0) {
            return Response.json(
                { success: false, message: "Department name already exists" },
                { status: 409 }
            );
        }

        // Update department
        await chatmate.execute(
            "UPDATE departments SET department_name = ? WHERE department_id = ?",
            [trimmedDepartmentName, department_id]
        );

        return Response.json({
            success: true,
            message: "Department updated successfully"
        });

    } catch (error) {
        console.error("Error updating department:", error);
        return Response.json(
            { success: false, message: "Failed to update department" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { department_id, id } = await request.json();
        const targetId = department_id || id;

        if (!targetId) {
            return Response.json(
                { success: false, message: "Department ID is required" },
                { status: 400 }
            );
        }

        // Check if department exists
        const [existing] = await chatmate.execute(
            "SELECT department_id FROM departments WHERE department_id = ?",
            [targetId]
        );

        if (existing.length === 0) {
            return Response.json(
                { success: false, message: "Department not found" },
                { status: 404 }
            );
        }

        // Delete all FAQs in this department first (cascade delete)
        await chatmate.execute(
            "DELETE FROM faqs WHERE department_id = ?",
            [targetId]
        );

        // Delete department
        await chatmate.execute(
            "DELETE FROM departments WHERE department_id = ?",
            [targetId]
        );

        return Response.json({
            success: true,
            message: "Department deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting department:", error);
        return Response.json(
            { success: false, message: "Failed to delete department" },
            { status: 500 }
        );
    }
}