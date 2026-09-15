import { Participant, Group } from '../types';

export interface GroupingResult {
  groups: Record<string, Group>;
  error?: string;
}

export function calculateOptimalTeams(participants: Participant[]): GroupingResult {
  const total = participants.length;

  if (total < 5) {
    return {
      groups: {},
      error: `At least 5 students are required to form teams (currently ${total}).`
    };
  }

  // Find candidate team count T
  // Preferred size is 5-6, max 7, min 5.
  let bestT: number | null = null;

  const minTeams = Math.ceil(total / 7);
  const maxTeams = Math.floor(total / 5);

  if (minTeams > maxTeams) {
    return {
      groups: {},
      error: `Cannot form balanced teams of size 5–7 for ${total} students.`
    };
  }

  // Try candidate T closest to average size 5.5 (or total / 6)
  const targetT = Math.round(total / 5.5);
  const candidates: number[] = [];

  for (let t = minTeams; t <= maxTeams; t++) {
    candidates.push(t);
  }

  // Sort candidates by closeness to targetT
  candidates.sort((a, b) => Math.abs(a - targetT) - Math.abs(b - targetT));

  bestT = candidates[0];

  const numTeams = bestT;
  const baseSize = Math.floor(total / numTeams);
  const extraCount = total % numTeams;

  // Shuffle participants to randomize before department distribution
  const shuffled = [...participants].sort(() => 0.5 - Math.random());

  // Group by department to distribute departments evenly across teams
  const deptMap: Record<string, Participant[]> = {};
  shuffled.forEach(p => {
    if (!deptMap[p.department]) deptMap[p.department] = [];
    deptMap[p.department].push(p);
  });

  // Flat list sorted by department frequency so departments are distributed round-robin
  const balancedList: Participant[] = [];
  const deptKeys = Object.keys(deptMap).sort((a, b) => deptMap[b].length - deptMap[a].length);

  let added = true;
  let idx = 0;
  while (added) {
    added = false;
    for (const d of deptKeys) {
      if (deptMap[d][idx]) {
        balancedList.push(deptMap[d][idx]);
        added = true;
      }
    }
    idx++;
  }

  const groups: Record<string, Group> = {};
  let currentParticipantIdx = 0;

  for (let i = 1; i <= numTeams; i++) {
    const groupId = `group_${i}`;
    const groupSize = i <= extraCount ? baseSize + 1 : baseSize;
    const teamMembers: Record<string, Participant> = {};

    for (let j = 0; j < groupSize; j++) {
      const p = balancedList[currentParticipantIdx++];
      if (p) {
        teamMembers[p.uid] = {
          ...p,
          groupId
        };
      }
    }

    groups[groupId] = {
      id: groupId,
      groupNumber: i,
      groupName: `TEAM ${i}`,
      captainId: null,
      captainName: null,
      businessIdea: null,
      presentationOrder: null,
      finalScore: null,
      members: teamMembers
    };
  }

  return { groups };
}
