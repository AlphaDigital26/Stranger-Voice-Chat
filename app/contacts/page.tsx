"use client";

import Link from "next/link";
import { MessageSquare, UserMinus, Users } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import { MOCK_CONTACTS, getStrangerName, formatRelativeTime } from "@/lib/mockData";
import Button from "@/components/ui/Button";

export default function ContactsPage() {
  const contacts = MOCK_CONTACTS.filter(c => c.status === "accepted");

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[640px] py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.75rem] font-bold text-[#18181B]">Contacts</h1>
            <p className="text-[14px] text-[#71717A] mt-0.5">{contacts.length} connection{contacts.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {contacts.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(124,92,252,0.1)] flex items-center justify-center">
              <Users size={28} className="text-[#7C5CFC]" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[#18181B] mb-1">No contacts yet</p>
              <p className="text-[14px] text-[#71717A]">Add someone after a great conversation.</p>
            </div>
            <Button variant="primary" pill size="lg" id="contacts-start-talking">
              <Link href="/intent">Start Talking</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {contacts.map(contact => {
              const name = getStrangerName(contact.contactUserId);
              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-4 bg-white border border-[#E5E5E8] rounded-[12px] px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/20 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C5CFC]/20 to-[#9B82FF]/20 flex items-center justify-center shrink-0">
                    <span className="text-[14px] font-bold text-[#7C5CFC]">
                      {name.replace("Stranger #", "S")}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#18181B] truncate">{name}</p>
                    <p className="text-[12px] text-[#71717A]">
                      Last talked {formatRelativeTime(contact.lastTalkedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/contacts/${contact.id}/messages`}
                    aria-label={`Message ${name}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#7C5CFC] bg-[rgba(124,92,252,0.08)] rounded-[8px] hover:bg-[rgba(124,92,252,0.15)] transition-colors"
                  >
                    <MessageSquare size={14} />
                    Message
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Ad slot — eligible on list view */}
        <div className="mt-8">
          <AdSlot height={90} />
        </div>
      </main>
    </div>
  );
}
