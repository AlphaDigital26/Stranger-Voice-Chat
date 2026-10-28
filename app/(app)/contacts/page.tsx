import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { PeopleDoodle } from "@/components/doodles/Doodles";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import { MOCK_CONTACTS, getStrangerName, formatRelativeTime } from "@/lib/mockData";

const AVATAR_NOTES = ["bg-note-yellow", "bg-note-pink", "bg-note-blue", "bg-note-green", "bg-note-orange"];

export default function ContactsPage() {
  const contacts = MOCK_CONTACTS.filter(c => c.status === "accepted");

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1 container-app max-w-[680px] py-10">
        <span className="font-hand text-[26px] text-marker">people you clicked with</span>
        <h1 className="mt-1 text-[2.25rem] font-extrabold tracking-tight leading-tight">Contacts</h1>
        <p className="mt-1 text-[15px] text-muted">
          {contacts.length} connection{contacts.length !== 1 ? "s" : ""}
        </p>

        {contacts.length === 0 ? (
          // Empty state
          <div className="mt-10 flex flex-col items-center gap-5 py-12 text-center">
            <div className="bg-note-yellow shadow-note px-7 py-6 -rotate-2">
              <PeopleDoodle size={44} draw className="mx-auto" />
              <p className="mt-2 font-hand font-bold text-[28px] leading-none">no contacts yet</p>
            </div>
            <p className="text-[15px] text-muted max-w-[300px]">After a great conversation, tap “Contact” to stay in touch.</p>
            <Link
              href="/intent"
              className="px-6 py-3 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[12px] transition-colors"
              id="contacts-start-talking"
            >
              Start talking
            </Link>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {contacts.map((contact, i) => {
              const name = getStrangerName(contact.contactUserId);
              return (
                <li
                  key={contact.id}
                  className="flex items-center gap-3 sm:gap-4 bg-surface border-2 border-outline rounded-[16px] px-3.5 sm:px-4 py-3.5"
                >
                  {/* Avatar */}
                  <span
                    className={`w-11 h-11 ${AVATAR_NOTES[i % AVATAR_NOTES.length]} flex items-center justify-center shrink-0 font-hand font-bold text-[20px] ${i % 2 ? "rotate-3" : "-rotate-3"}`}
                    aria-hidden="true"
                  >
                    {name.replace("Stranger #", "#").slice(0, 3)}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold truncate">{name}</p>
                    <p className="text-[13px] text-muted">
                      Last talked {formatRelativeTime(contact.lastTalkedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/contacts/${contact.id}/messages`}
                    aria-label={`Message ${name}`}
                    className="shrink-0 flex items-center justify-center gap-1.5 min-w-[44px] px-3 sm:px-3.5 min-h-[44px] text-[14px] font-bold border-2 border-outline rounded-[10px] hover:bg-paper-2 transition-colors"
                  >
                    <MessageSquare size={16} />
                    {/* Icon-only on phones; aria-label above names the action */}
                    <span className="hidden sm:inline">Message</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Ad slot — eligible on list view */}
        <div className="mt-10">
          <AdSlot height={90} variant={3} />
        </div>
      </main>
    </div>
  );
}
