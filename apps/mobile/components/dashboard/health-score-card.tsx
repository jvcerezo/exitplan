import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react-native";
import type { HealthScore } from "@/hooks/use-health-score";

interface HealthScoreCardProps {
  healthScore: HealthScore;
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? "#10b981"
      : score >= 60
      ? "#f59e0b"
      : score >= 40
      ? "#f97316"
      : "#ef4444";

  return (
    <View className="items-center">
      <View
        className="w-16 h-16 rounded-full border-4 items-center justify-center"
        style={{ borderColor: color }}
      >
        <Text variant="h4" style={{ color }}>
          {score}
        </Text>
      </View>
    </View>
  );
}

export function HealthScoreCard({ healthScore }: HealthScoreCardProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Heart size={18} color="#7c3aed" />
          <Text variant="h4">Financial Health</Text>
        </View>
        <ScoreRing score={healthScore.total} />
      </View>
      <View className="gap-2">
        {healthScore.subScores.map((sub) => (
          <View key={sub.label} className="gap-1">
            <View className="flex-row justify-between">
              <Text variant="body-sm" color="muted">
                {sub.label}
              </Text>
              <Text variant="body-sm">{sub.score}</Text>
            </View>
            <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${sub.score}%` }}
              />
            </View>
            <Text variant="caption" color="muted">
              {sub.detail}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
