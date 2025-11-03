import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT_EMAIL } from '@/lib/config';
import { useToast } from "@/hooks/use-toast";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (!emailRegex.test(email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
      const { data, error } = await (supabase as any).functions.invoke("contact-send", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Message sent", description: "Thanks — we'll respond soon." });
      reset();
      setOpen(false);
    } catch (err: any) {
      console.error("Contact send error:", err);
      toast({ title: "Send failed", description: err?.message ?? String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Contact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm">Your name</label>
            <Input value={name} onChange={(e: any) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Your email</label>
            <Input value={email} onChange={(e: any) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Subject</label>
            <Input value={subject} onChange={(e: any) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Message</label>
            <Textarea value={message} onChange={(e: any) => setMessage(e.target.value)} />
          </div>

          <div className="text-sm text-muted-foreground">Your message will be sent to <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a></div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { reset(); setOpen(false); }} type="button">Cancel</Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
