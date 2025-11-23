import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Mic, Image as ImageIcon, AlertCircle, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder, blobToBase64 } from "@/utils/audioRecorder";

interface AIAssistantProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isHighRisk?: boolean;
}

const AIAssistant = ({ onBack }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI health assistant. You can ask me about:\n\n• Pregnancy care (ANC/PNC)\n• Child health & vaccination\n• Common illnesses\n• Nutrition guidance\n• When to refer\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = [
    "Danger signs in pregnancy",
    "Child vaccination schedule",
    "Managing fever in children",
    "Nutrition for pregnant women",
  ];

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in production, this would call your AI backend)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: generateResponse(messageText),
        isHighRisk: messageText.toLowerCase().includes("bleeding") || 
                     messageText.toLowerCase().includes("unconscious"),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (question: string) => {
    const q = question.toLowerCase();
    
    if (q.includes("danger") && q.includes("pregnan")) {
      return "🚨 DANGER SIGNS in Pregnancy (Immediate Referral Needed):\n\n1. Severe headache with blurred vision\n2. Vaginal bleeding\n3. High fever (>101°F)\n4. Severe abdominal pain\n5. Reduced fetal movements\n6. Convulsions\n7. Water breaks before 37 weeks\n\n⚠️ ACTION: Refer immediately to PHC/District Hospital\n📱 Call 108 ambulance if needed\n\n💊 First Aid: Keep mother calm, lying on left side, monitor vitals.";
    }
    
    if (q.includes("vaccination") || q.includes("vaccine")) {
      return "💉 CHILD VACCINATION SCHEDULE:\n\nBirth: BCG, OPV-0, Hep-B\n6 weeks: DPT-1, OPV-1, Hep-B-1, Rota-1\n10 weeks: DPT-2, OPV-2, Hep-B-2, Rota-2\n14 weeks: DPT-3, OPV-3, Hep-B-3, Rota-3\n9-12 months: Measles-1, Vitamin A\n16-24 months: DPT booster, OPV booster, Measles-2\n\n📋 Always check the Mother-Child Protection Card!\n⏰ Set follow-up reminders for next dose.";
    }
    
    if (q.includes("fever") && q.includes("child")) {
      return "🌡️ MANAGING FEVER IN CHILDREN:\n\n✅ IF fever < 101°F:\n• Sponge with normal water\n• Give paracetamol (10-15 mg/kg)\n• Plenty of fluids\n• Light clothing\n• Monitor every 4 hours\n\n🚨 REFER IF:\n• Fever > 102°F for >3 days\n• Child refuses to eat/drink\n• Difficulty breathing\n• Rash appears\n• Child very drowsy\n• Age < 3 months\n\n📝 Document: Temperature, duration, associated symptoms.";
    }
    
    if (q.includes("nutrition") && q.includes("pregnan")) {
      return "🥗 NUTRITION FOR PREGNANT WOMEN:\n\n✅ MUST HAVE:\n• IFA tablets daily (100mg iron + 500μg folic acid)\n• Calcium (1000mg/day)\n• Extra meal (one more than usual)\n• Green leafy vegetables\n• Pulses, eggs, milk\n• Fruits (seasonal)\n\n❌ AVOID:\n• Tobacco, alcohol\n• Raw/undercooked food\n• Too much tea/coffee\n\n💊 Iron tablets: Take with vitamin C (lemon water) for better absorption\n⏰ Check weight gain: 10-12 kg during pregnancy is normal.";
    }

    if (q.includes("voice") || q.includes("image")) {
      return "I've received your " + (q.includes("voice") ? "voice" : "image") + " input. Based on what you've shared:\n\n• I'll analyze this information according to health protocols\n• If any danger signs are present, I'll alert you immediately\n• Please provide additional context if needed\n\nWhat else would you like to know?";
    }

    return "I understand you're asking about: \"" + question + "\"\n\nFor the most accurate guidance, please:\n1. Describe the patient's age and symptoms\n2. Mention any danger signs\n3. Let me know the duration of the problem\n\nOr choose from the quick questions below for common topics.";
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      try {
        const audioBlob = await audioRecorderRef.current?.stop();
        setIsRecording(false);
        
        if (audioBlob) {
          setIsLoading(true);
          const base64Audio = await blobToBase64(audioBlob);
          
          toast({
            title: "Voice Recording Captured",
            description: "Processing your voice input...",
          });
          
          const userMessage: Message = {
            role: "user",
            content: "[Voice input recorded: Health query about patient condition]",
          };
          setMessages((prev) => [...prev, userMessage]);
          
          const response = generateResponse("voice input recorded");
          const aiResponse: Message = {
            role: "assistant",
            content: response,
          };
          setMessages((prev) => [...prev, aiResponse]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        toast({
          title: "Error",
          description: "Failed to process voice recording",
          variant: "destructive",
        });
        setIsRecording(false);
        setIsLoading(false);
      }
    } else {
      try {
        audioRecorderRef.current = new AudioRecorder();
        await audioRecorderRef.current.start();
        setIsRecording(true);
        toast({
          title: "Recording Started",
          description: "Speak now... Tap again to stop.",
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Error",
          description: "Could not access microphone. Please grant permission.",
          variant: "destructive",
        });
      }
    }
  };

  const handleImageCapture = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      toast({
        title: "Image Captured",
        description: "Analyzing image for medical assessment...",
      });

      const userMessage: Message = {
        role: "user",
        content: "[Image uploaded: Medical photo for analysis]",
      };
      setMessages((prev) => [...prev, userMessage]);

      const response = generateResponse("image uploaded for analysis");
      const aiResponse: Message = {
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">AI Health Assistant</h2>
            <p className="text-xs text-muted-foreground">
              {isRecording ? "🔴 Recording..." : "Protocol-based guidance"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-[85%] p-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : msg.isHighRisk
                  ? "border-destructive bg-destructive/10"
                  : ""
              }`}
            >
              {msg.isHighRisk && (
                <div className="mb-2 flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs font-semibold">HIGH RISK ALERT</span>
                </div>
              )}
              <p className="whitespace-pre-line text-sm">{msg.content}</p>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.1s" }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick questions:</p>
            {quickQuestions.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => handleSend(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageSelected}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceToggle}
            disabled={isLoading}
            className={isRecording ? "bg-destructive text-destructive-foreground" : ""}
          >
            {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleImageCapture}
            disabled={isLoading || isRecording}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Ask a health question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
            disabled={isRecording}
          />
          <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isRecording}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
