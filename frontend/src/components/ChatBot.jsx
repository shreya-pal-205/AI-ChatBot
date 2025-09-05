import React, { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim()) return;

    const newChat = [...chat, { role: "user", text: input }];
    setChat(newChat);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://ai-chatbot-backend-fuui.onrender.com/ask",
        { question: input }
      );

      setChat([
        ...newChat,
        { role: "bot", text: res.data.answer || "No response." },
      ]);
    } catch (err) {
      console.error(err);
      setChat([
        ...newChat,
        { role: "bot", text: "⚠️ Error: Could not fetch response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-gradient-to-r from-[#D7D7D7] via-white to-[#447D9B]/10">
      {/* Left Section - Info (hidden on mobile) */}
      <div className="hidden md:block md:w-1/3 bg-[#273F4F] text-white border-r border-[#FE7743]/40 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#FE7743] mb-4">
          🎓 How this Chatbot Helps
        </h2>
        <p className="text-[#D7D7D7] mb-6 leading-relaxed text-sm sm:text-base">
          ✅ Get instant{" "}
          <span className="font-semibold text-[#447D9B]">
            career guidance after 10th & 12th
          </span>{" "}
          based on your interests and strengths.
          <br />
          ✅ Explore streams like Science, Commerce, Arts, and Vocational fields.
          <br />
          ✅ Compare career options, higher studies, and job opportunities.
        </p>

        <h3 className="text-xl font-semibold text-[#FE7743] mb-3">
          🏆 Popular Career Paths
        </h3>
        <ul className="list-disc list-inside text-[#D7D7D7] space-y-1 text-sm">
          <li>1. Engineering & Technology</li>
          <li>2. Medicine & Healthcare</li>
          <li>3. Commerce & Management</li>
          <li>4. Arts, Humanities & Social Sciences</li>
          <li>5. Computer Science & AI/ML</li>
          <li>6. Law & Civil Services</li>
          <li>7. Design, Media & Communication</li>
          <li>8. Vocational & Skill-based Careers</li>
          <li>9. Entrepreneurship & Startups</li>
          <li>10. Government Jobs & Defence</li>
        </ul>
      </div>

      {/* Right Section - Chatbot */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header */}
        <div className="bg-[#273F4F] text-white py-4 px-4 flex items-center shadow-md sticky top-0 z-10">
          <div className="w-10 h-10 rounded-full bg-[#FE7743] flex items-center justify-center mr-3 text-white font-bold">
            🤖
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">
              Career Guidance Chatbot
            </h1>
            <p className="text-xs sm:text-sm text-[#D7D7D7]">
              💡 Ask about courses, career options & future opportunities
            </p>
          </div>
        </div>

        {/* Chatbox */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-gradient-to-b from-[#ECECEC] to-white">
          {chat.map((c, i) => (
            <div
              key={i}
              className={`mb-3 flex ${
                c.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl shadow-md max-w-[75%] sm:max-w-sm md:max-w-md text-sm break-words ${
                  c.role === "user"
                    ? "bg-[#FE7743] text-white rounded-br-none"
                    : "bg-[#447D9B] text-white rounded-bl-none"
                }`}
              >
                {c.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-center text-[#447D9B] italic animate-pulse">
              🤔 Bot is thinking...
            </p>
          )}
        </div>

        {/* Input box */}
        <div className="bg-[#F0F0F0] border-t border-gray-300 p-2 sm:p-4 flex items-center gap-2 sticky bottom-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            className="flex-1 w-full border border-gray-300 px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FE7743] bg-white text-sm"
            placeholder="Type your career query..."
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="bg-[#273F4F] hover:bg-[#FE7743] text-white px-5 py-2 rounded-full shadow-md transition-all duration-300 text-sm"
          >
            {loading ? "..." : "Send 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
