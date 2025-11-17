import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/api-keys/[id]
 * Revoke/delete an API key
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the key belongs to the user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the key
    await prisma.apiKey.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/api-keys/[id]
 * Update API key (name or permissions)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: params.id },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    if (apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, permissions } = body

    const updatedKey = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(permissions !== undefined && { permissions }),
      },
    })

    return NextResponse.json({ apiKey: updatedKey })
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    )
  }
}
