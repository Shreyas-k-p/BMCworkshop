import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { useParticipants } from './hooks/useParticipants';
import { useGroups } from './hooks/useGroups';
import { useScores } from './hooks/useScores';
import { useConnectionState } from './hooks/useConnectionState';

import { createSession, findSessionByCode, updateSessionUIState, endSession } from './firebase/sessionService';
import { joinSessionAsStudent, addDemoStudents } from './firebase/participantService';
import { createBalancedGroups, selectCaptainForGroup, assignProductsToGroups, generateAndSavePresentationOrder } from './firebase/groupService';
import { submitScore, simulateDemoCaptainScores, calculateAndRevealLeaderboard } from './firebase/scoreService';
import { startTimer, pauseTimer, resetTimer } from './firebase/timerService';

import { HostHome } from './components/host/HostHome';
import { HostControlBar } from './components/host/HostControlBar';
import { HostLobby } from './components/host/HostLobby';
import { HostTeamFormation } from './components/host/HostTeamFormation';
import { HostCaptainSelection } from './components/host/HostCaptainSelection';
import { HostProductReveal } from './components/host/HostProductReveal';
import { HostTimerStage } from './components/host/HostTimerStage';
import { HostPresentation } from './components/host/HostPresentation';
import { HostLeaderboard } from './components/host/HostLeaderboard';

import { StudentJoin } from './components/student/StudentJoin';
import { StudentLobby } from './components/student/StudentLobby';
import { StudentTeamsView } from './components/student/StudentTeamsView';
import { StudentTimerView } from './components/student/StudentTimerView';
import { StudentScoringView } from './components/student/StudentScoringView';
import { StudentLeaderboard } from './components/student/StudentLeaderboard';
import { FloatingMessagesOverlay } from './components/common/FloatingMessagesOverlay';

import { Participant, Department } from './types';
import { WifiOff } from 'lucide-react';

const HOST_SESSION_KEY = 'bmc_live_host_session_id';
const STUDENT_PARTICIPANT_KEY = 'bmc_live_student_identity';

export function App() {
  const authState = useAuth();
  const { user } = authState;
  const isConnected = useConnectionState();

  const pathname = window.location.pathname;
  const joinMatch = pathname.match(/\/join\/([A-Za-z0-9]+)/);
  const routeCode = joinMatch ? joinMatch[1].toUpperCase() : null;
  const isStudentRoute = Boolean(routeCode);

  const [hostSessionId, setHostSessionId] = useState<string | null>(() => {
    return localStorage.getItem(HOST_SESSION_KEY);
  });

  const [studentSessionId, setStudentSessionId] = useState<string | null>(null);
  const [studentParticipant, setStudentParticipant] = useState<Participant | null>(() => {
    const saved = localStorage.getItem(STUDENT_PARTICIPANT_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const activeSessionId = isStudentRoute ? studentSessionId : hostSessionId;

  const { session } = useSession(activeSessionId);
  const { participants } = useParticipants(activeSessionId);
  const { groups } = useGroups(activeSessionId);
  const { scores } = useScores(activeSessionId);

  useEffect(() => {
    if (isStudentRoute && routeCode && !studentSessionId) {
      findSessionByCode(routeCode).then((s) => {
        if (s && s.hasActiveSession) {
          setStudentSessionId(s.id);
        }
      });
    }
  }, [isStudentRoute, routeCode, studentSessionId]);

  useEffect(() => {
    if (studentParticipant && participants.length > 0) {
      const updated = participants.find(p => p.uid === studentParticipant.uid);
      if (updated) {
        setStudentParticipant(updated);
        localStorage.setItem(STUDENT_PARTICIPANT_KEY, JSON.stringify(updated));
      }
    }
  }, [participants]);

  const handleHostCreateSession = async () => {
    if (!user) throw new Error('Host authentication is not ready');
    const newSession = await createSession();
    setHostSessionId(newSession.id);
    localStorage.setItem(HOST_SESSION_KEY, newSession.id);
  };

  const handleHostRestartSession = () => {
    if (hostSessionId) {
      endSession(hostSessionId).catch(console.error);
    }
    setHostSessionId(null);
    localStorage.removeItem(HOST_SESSION_KEY);
  };

  const handleHostEndSession = async () => {
    if (hostSessionId) {
      await endSession(hostSessionId);
    }
    setHostSessionId(null);
    localStorage.removeItem(HOST_SESSION_KEY);
  };

  const handleStudentJoin = async (code: string, name: string, department: Department) => {
    if (!user) throw new Error('Student authentication is not ready');
    const foundSession = await findSessionByCode(code);
    if (!foundSession) {
      throw new Error('SESSION NOT FOUND');
    }
    if (!foundSession.hasActiveSession) {
      throw new Error('SESSION HAS ENDED');
    }

    const participant = await joinSessionAsStudent(foundSession.id, user.uid, name, department);
    setStudentSessionId(foundSession.id);
    setStudentParticipant(participant);
    localStorage.setItem(STUDENT_PARTICIPANT_KEY, JSON.stringify(participant));
  };

  const renderReconnectBanner = () => {
    if (isConnected) return null;
    return (
      <div className="bg-amber-500 text-navy-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 z-50 sticky top-0 shadow-lg">
        <WifiOff className="w-4 h-4 animate-bounce" />
        NETWORK DISCONNECTED — RECONNECTING TO BMC LIVE...
      </div>
    );
  };

  // ==========================================
  // STUDENT VIEW ROUTING
  // ==========================================
  if (isStudentRoute) {
    if (!studentParticipant || !studentSessionId || !session) {
      return (
        <div className="min-h-screen bg-navy-950 flex flex-col">
          {renderReconnectBanner()}
          <StudentJoin initialCode={routeCode || ''} onJoin={handleStudentJoin} />
        </div>
      );
    }

    if (!session.hasActiveSession || session.uiState === 'COMPLETED') {
      return (
        <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
          {renderReconnectBanner()}
          <h2 className="text-4xl font-black text-white">SESSION HAS ENDED</h2>
          <p className="text-slate-400 text-sm">Thank you for participating in BMC LIVE!</p>
          <button
            onClick={() => {
              setStudentParticipant(null);
              setStudentSessionId(null);
              localStorage.removeItem(STUDENT_PARTICIPANT_KEY);
              window.location.href = '/';
            }}
            className="px-6 py-3 rounded-xl bg-cyan-500 font-extrabold text-navy-950"
          >
            BACK TO HOME
          </button>
        </div>
      );
    }

    const renderStudentContent = () => {
      switch (session.uiState) {
        case 'NO_SESSION':
        case 'JOINING':
        case 'GROUPING':
          return <StudentLobby participant={studentParticipant} session={session} />;

        case 'GROUPS_READY':
        case 'CAPTAIN_SELECTION':
        case 'PRODUCT_REVEAL':
          return <StudentTeamsView groups={groups} currentParticipant={studentParticipant} sessionId={session.id} />;

        case 'PREPARATION':
        case 'STUDY_TIME':
          return (
            <StudentTimerView
              session={session}
              myGroup={groups[studentParticipant.groupId || '']}
              currentParticipant={studentParticipant}
            />
          );

        case 'PRESENTATION_ORDER':
        case 'PRESENTATION':
        case 'SCORING':
          return (
            <StudentScoringView
              session={session}
              groups={groups}
              scores={scores}
              currentParticipant={studentParticipant}
              onSubmitScore={(presentingGroupId, score) =>
                submitScore(session.id, presentingGroupId, studentParticipant.uid, studentParticipant.groupId || '', score)
              }
            />
          );

        case 'LEADERBOARD':
          return <StudentLeaderboard groups={groups} currentParticipant={studentParticipant} />;

        default:
          return <StudentTeamsView groups={groups} currentParticipant={studentParticipant} />;
      }
    };

    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        {renderReconnectBanner()}
        {renderStudentContent()}
      </div>
    );
  }

  // ==========================================
  // HOST VIEW ROUTING
  // ==========================================

  if (!hostSessionId || !session || !session.hasActiveSession) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        {renderReconnectBanner()}
        <HostHome onCreateSession={handleHostCreateSession} authState={authState} />
      </div>
    );
  }

  const renderHostStageContent = () => {
    switch (session.uiState) {
      case 'JOINING':
      case 'NO_SESSION':
        return (
          <HostLobby
            session={session}
            participants={participants}
            onAddDemoStudents={() => addDemoStudents(session.id, 10)}
            onCreateTeams={() => createBalancedGroups(session.id).then(() => {})}
          />
        );

      case 'GROUPING':
      case 'GROUPS_READY':
        return (
          <HostTeamFormation
            groups={groups}
            onProceedToCaptains={() => updateSessionUIState(session.id, 'CAPTAIN_SELECTION')}
          />
        );

      case 'CAPTAIN_SELECTION':
        return (
          <HostCaptainSelection
            groups={groups}
            onSelectCaptain={(gId, cUid, cName) => selectCaptainForGroup(session.id, gId, cUid, cName)}
            onConfirmAllCaptains={() => assignProductsToGroups(session.id)}
          />
        );

      case 'PRODUCT_REVEAL':
        return (
          <HostProductReveal
            groups={groups}
            onStartPreparation={() => updateSessionUIState(session.id, 'PREPARATION')}
          />
        );

      case 'PREPARATION':
        return (
          <HostTimerStage
            session={session}
            stageType="PREPARATION"
            onStartTimer={() => startTimer(session.id, 'preparation')}
            onPauseTimer={() => pauseTimer(session.id, 'preparation')}
            onResetTimer={() => resetTimer(session.id, 'preparation', 900)}
            onProceedToNext={() => updateSessionUIState(session.id, 'STUDY_TIME')}
          />
        );

      case 'STUDY_TIME':
        return (
          <HostTimerStage
            session={session}
            stageType="STUDY_TIME"
            onStartTimer={() => startTimer(session.id, 'study')}
            onPauseTimer={() => pauseTimer(session.id, 'study')}
            onResetTimer={() => resetTimer(session.id, 'study', 600)}
            onProceedToNext={() => generateAndSavePresentationOrder(session.id).then(() => {})}
          />
        );

      case 'PRESENTATION_ORDER':
      case 'PRESENTATION':
      case 'SCORING':
        return (
          <HostPresentation
            session={session}
            groups={groups}
            scores={scores}
            onStartPresentationTimer={() => startTimer(session.id, 'presentation')}
            onPausePresentationTimer={() => pauseTimer(session.id, 'presentation')}
            onResetPresentationTimer={() => resetTimer(session.id, 'presentation', 180)}
            onNextTeam={async () => {
              const order = session.presentationOrder || Object.keys(groups);
              const nextIdx = (session.presentationIndex || 0) + 1;
              if (nextIdx < order.length) {
                await updateSessionUIState(session.id, 'PRESENTATION', session.stateVersion, {
                  presentationIndex: nextIdx,
                  currentPresentingTeamId: order[nextIdx]
                });
                await resetTimer(session.id, 'presentation', 180);
              }
            }}
            onRevealLeaderboard={() => calculateAndRevealLeaderboard(session.id)}
            onSimulateDemoScores={(presentingGroupId) => simulateDemoCaptainScores(session.id, presentingGroupId)}
          />
        );

      case 'LEADERBOARD':
      case 'COMPLETED':
        return (
          <HostLeaderboard
            groups={groups}
            onRestartSession={handleHostRestartSession}
            onEndSession={handleHostEndSession}
          />
        );

      default:
        return (
          <HostLobby
            session={session}
            participants={participants}
            onAddDemoStudents={() => addDemoStudents(session.id, 10)}
            onCreateTeams={() => createBalancedGroups(session.id).then(() => {})}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col text-slate-100 relative">
      {renderReconnectBanner()}
      {session && <FloatingMessagesOverlay sessionId={session.id} />}
      <HostControlBar
        session={session}
        participantCount={participants.length}
        onEndSession={handleHostEndSession}
        onRestartSession={handleHostRestartSession}
      />
      <main className="flex-1 overflow-x-hidden">
        {renderHostStageContent()}
      </main>
    </div>
  );
}
export default App;
