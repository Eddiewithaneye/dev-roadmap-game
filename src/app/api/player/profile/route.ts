import { NextResponse } from "next/server"; // returns JSON responses
import {auth} from "@/auth"
import { getOrCreatePlayerProfile } from "@/lib/db/playerProfiles"; //profile helper

// create backend route handler
export async function GET(){
    const session = await auth(); // who is logged in?
    
    // logic for unauthorized user
    if (!session?.user?.id){
        return NextResponse.json(
            { error: "Unauthorized"},
            { status: 401 }
        );
    }

    const displayName = 
        session.user.name ?? session.user.email ?? "Developer";

    const profile = await getOrCreatePlayerProfile(
        session.user.id,
        displayName,
    );

    return NextResponse.json({
        profile: {
            displayName: profile.displayName,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        },
    });
}