import { NextRequest, NextResponse } from "next/server";
import { toggleDeviceStatus } from "@/lib/device-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!["REVOKE", "RESTORE", "DELETE"].includes(action)) {
      return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
    }

    const result = await toggleDeviceStatus(id, action);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PATCH /api/settings/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del dispositivo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await toggleDeviceStatus(id, "DELETE");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DELETE /api/settings/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Errore durante la rimozione del dispositivo" },
      { status: 500 }
    );
  }
}
