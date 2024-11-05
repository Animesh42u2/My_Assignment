import React, { useState, useEffect } from 'react';

const CircleIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="4" cy="8" r="1" fill="currentColor"/>
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
    <circle cx="12" cy="8" r="1" fill="currentColor"/>
  </svg>
);

const priorityLabels = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No priority'
};

const statusIcons = {
  'Todo': <CircleIcon className="status-icon" />,
  'In progress': <ClockIcon className="status-icon status-progress" />,
  'Backlog': <CircleIcon className="status-icon" />,
  'Done': <CheckCircleIcon className="status-icon status-done" />,
  'Cancelled': <CircleIcon className="status-icon status-cancelled" />
};

export default function KanbanBoard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then((data) => {
        setTickets(data.tickets);
        setUsers(data.users);
      });
  }, []);

  const groupTickets = (tickets) => {
    return tickets.reduce((acc, ticket) => {
      let key;
      if (grouping === 'status') {
        key = ticket.status;
      } else if (grouping === 'user') {
        const user = users.find(u => u.id === ticket.userId);
        key = user ? user.name : 'Unassigned';
      } else if (grouping === 'priority') {
        key = priorityLabels[ticket.priority];
      }
      if (!acc[key]) acc[key] = [];
      acc[key].push(ticket);
      return acc;
    }, {});
  };

  const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      if (sorting === 'priority') return b.priority - a.priority;
      return a.title.localeCompare(b.title);
    });
  };

  const groupedAndSortedTickets = groupTickets(sortTickets(tickets));

  const GroupHeader = ({ title, count }) => (
    <div className="group-header">
      <div className="group-header-left">
        {statusIcons[title] || null}
        <h2>{title}</h2>
        <span className="task-count">{count}</span>
      </div>
      <div className="group-header-actions">
        <button className="icon-button">
          <PlusIcon />
        </button>
        <button className="icon-button">
          <MoreIcon />
        </button>
      </div>
    </div>
  );

  return (
    <div className="kanban-board">
      <div className="display-controls">
        <div className="display-button-container">
          <button 
            className="display-button"
            onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}
          >
            <span className="hamburger">☰</span>
            Display
            <span className="arrow">{isDisplayMenuOpen ? '▼' : '▶'}</span>
          </button>
          
          {isDisplayMenuOpen && (
            <div className="display-dropdown">
              <div className="dropdown-item">
                <span className="dropdown-label">Grouping</span>
                <select 
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="status">Status</option>
                  <option value="user">User</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              <div className="dropdown-item">
                <span className="dropdown-label">Ordering</span>
                <select 
                  value={sorting}
                  onChange={(e) => setSorting(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="task-container">
        {Object.entries(groupedAndSortedTickets).map(([group, tickets]) => (
          <div key={group} className="task-group">
            <GroupHeader title={group} count={tickets.length} />
            <div className="task-cards-container">
              {tickets.map(ticket => {
                const user = users.find(u => u.id === ticket.userId);
                return (
                  <div key={ticket.id} className="task-card">
                    <div className="task-header">
                      <p className="task-id">{ticket.id}</p>
                      <div className="task-avatar">
                        <img
                          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user ? user.name : 'UN'}`}
                          alt={user ? user.name : 'Unassigned'}
                          className="avatar-image"
                        />
                      </div>
                    </div>
                    <h3 className="task-title">{ticket.title}</h3>
                    <div className="task-footer">
                      <div className="task-priority">
                        <span className={`priority-dot priority-${ticket.priority}`}></span>
                        <span className="priority-label">{priorityLabels[ticket.priority]}</span>
                      </div>
                      <div className="task-tag">
                        {ticket.tag.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}