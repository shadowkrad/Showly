import { NextRequest, NextResponse } from "next/server";
import { getRegisteredDevicesList, toggleDeviceStatus } from "@/lib/device-auth";

export async function GET() {
  try {
    const result = await getRegisteredDevicesList();
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/settings/devices error:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero dei dispositivi" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }
    const result = await toggleDeviceStatus(id, "REVOKE");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DELETE /api/settings/devices error:", error);
    return NextResponse.json(
      { error: "Errore durante la revoca del dispositivo" },
      { status: 500 }
    );
  }
}
