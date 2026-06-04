import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

const JOINCODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateJoinCode(): string {
  return Array.from({ length: 6 }, () => 
    JOINCODE_CHARS[Math.floor(Math.random() * JOINCODE_CHARS.length)]
  ).join("");
}

async function generateUniqueJoinCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const joinCode = generateJoinCode();
    const existing = await prisma.party.findUnique({ where: { joinCode } });
    if (!existing) {
      return joinCode;
    }
  }
  throw new Error("Failed to generate unique join code after 5 attempts");
}

// POST /api/parties - Create a party
router.post("/", async (req, res) => {
  try {
    const { name, hostName, maxSongs, maxDuration } = req.body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Name is required and must be a non-empty string" });
    }

    if (!hostName || typeof hostName !== "string" || hostName.trim() === "") {
      return res.status(400).json({ error: "Host name is required and must be a non-empty string" });
    }

    // Validate optional fields
    if (maxSongs !== undefined && (!Number.isInteger(maxSongs) || maxSongs <= 0)) {
      return res.status(400).json({ error: "maxSongs must be a positive integer" });
    }

    if (maxDuration !== undefined && (!Number.isInteger(maxDuration) || maxDuration <= 0)) {
      return res.status(400).json({ error: "maxDuration must be a positive integer" });
    }

    // Generate unique join code
    const joinCode = await generateUniqueJoinCode();

    // Create party with host participant using transaction
    const { party, host } = await prisma.$transaction(async (tx) => {
      const created = await tx.party.create({
        data: { 
          name: name.trim(), 
          joinCode, 
          hostId: "pending", 
          maxSongs, 
          maxDuration,
          participants: { create: { name: hostName.trim() } } 
        },
        include: { participants: true },
      });
      
      const host = created.participants[0];
      
      const party = await tx.party.update({
        where: { id: created.id },
        data: { hostId: host.id },
        include: { participants: true },
      });
      
      return { party, host };
    });

    res.status(201).json({
      party,
      joinCode,
      participantId: host.id,
    });
  } catch (error) {
    console.error("Error creating party:", error);
    res.status(500).json({ error: "Failed to create party" });
  }
});

// GET /api/parties/:joinCode - Get party by join code
router.get("/:joinCode", async (req, res) => {
  try {
    const { joinCode } = req.params;

    const party = await prisma.party.findUnique({
      where: { joinCode },
      include: {
        participants: true,
        songs: {
          include: {
            votes: true,
          },
        },
      },
    });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    res.json({ party });
  } catch (error) {
    console.error("Error fetching party:", error);
    res.status(500).json({ error: "Failed to fetch party" });
  }
});

export default router;