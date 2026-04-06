import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ListView from './components/views/ListView';
import CardView from './components/views/CardView';
import KanbanView from './components/views/KanbanView';
import TimelineView from './components/views/TimelineView';
import RecapView from './components/views/RecapView';
import MemoriesView from './components/views/MemoriesView';
import SettingsView from './components/views/SettingsView';
import { useActivities } from './hooks/useActivities';

type ViewType = 'list' | 'cards' | 'kanban' | 'timeline' | 'recap' | 'memories' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const activitiesHook = useActivities();

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <ListView {...activitiesHook} />;
      case 'cards':
        return <CardView {...activitiesHook} />;
      case 'kanban':
        return <KanbanView {...activitiesHook} />;
      case 'timeline':
        return <TimelineView {...activitiesHook} />;
      case 'recap':
        return <RecapView {...activitiesHook} />;
      case 'memories':
        return <MemoriesView {...activitiesHook} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ListView {...activitiesHook} />;
    }
  };

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main style={{ flex: 1, overflow: 'auto' }}>
          {renderView()}
        </main>
      </div>
    </Router>
  );
}

export default App;
