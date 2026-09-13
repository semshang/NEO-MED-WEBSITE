"use client";
import { useState, useMemo } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Reply } from "lucide-react";

export default function MessagesPage() {
  const { messages, updateMessage } = useAdmin();
  const [filter, setFilter] = useState<"All" | "Unread" | "Read">("All");
  const [search, setSearch] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchFilter = filter === "All" || (filter === "Unread" ? m.unread : !m.unread);
      const matchSearch = m.senderName.toLowerCase().includes(search.toLowerCase()) || 
                          m.subject.toLowerCase().includes(search.toLowerCase()) ||
                          m.email.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [messages, filter, search]);

  const selectedMessage = messages.find(m => m.id === selectedMessageId);

  const handleMessageClick = (id: string, unread: boolean) => {
    setSelectedMessageId(id);
    if (unread) {
      updateMessage(id, { unread: false });
    }
  };

  const handleMarkAsRead = (id: string) => {
    updateMessage(id, { unread: false });
  };

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Messages</h1>
          <p className="text-slate-500 mt-1">View and manage customer inquiries</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto space-x-2 pb-2 md:pb-0 hide-scrollbar">
            {(["All", "Unread", "Read"] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === t ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search sender or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Sender</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMessages.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No messages found.</td></tr>
              ) : filteredMessages.map((msg, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={msg.id} 
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${msg.unread ? 'bg-brand-blue/5' : ''}`}
                  onClick={() => handleMessageClick(msg.id, msg.unread)}
                >
                  <td className="py-4 px-6 text-sm text-slate-600">
                    <div className={`${msg.unread ? 'font-bold text-brand-navy' : 'font-medium text-slate-900'}`}>{msg.senderName}</div>
                    <div className="text-xs text-slate-400 mt-1">{msg.email}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 max-w-[300px]">
                    <div className={`${msg.unread ? 'font-bold text-brand-navy' : 'font-medium text-slate-900'} truncate`}>{msg.subject}</div>
                    <div className="text-xs text-slate-400 mt-1 truncate">{msg.body}</div>
                  </td>
                  <td className={`py-4 px-6 text-sm ${msg.unread ? 'font-bold text-brand-navy' : 'text-slate-500'}`}>
                    {new Date(msg.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {msg.unread ? (
                      <span className="inline-flex items-center text-xs font-bold text-brand-blue">
                        <span className="w-2 h-2 bg-brand-blue rounded-full mr-2"></span>
                        Unread
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Read</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {msg.unread && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(msg.id); }}
                        className="text-xs text-brand-blue hover:text-blue-700 font-medium transition-colors border border-brand-blue/30 bg-white px-2 py-1 rounded"
                      >
                        Mark as Read
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-brand-navy">Message Details</h2>
                  <p className="text-sm text-slate-500">{new Date(selectedMessage.date).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedMessageId(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Sender Info</h3>
                    <p className="font-medium text-brand-navy text-lg">{selectedMessage.senderName}</p>
                    <p className="text-slate-600">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</h3>
                    <p className="font-medium text-brand-navy">{selectedMessage.subject}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Message</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                {selectedMessage.email ? (
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply via Email
                  </a>
                ) : (
                  <div></div>
                )}
                
                <button onClick={() => setSelectedMessageId(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
