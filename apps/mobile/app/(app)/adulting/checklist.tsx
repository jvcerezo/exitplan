import React, { useState } from "react";
import { View, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useChecklistProgress, useToggleChecklistItem } from "@/hooks/use-adulting-checklist";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/lib/theme";
import { CHECKLIST_PHASES, TOTAL_ITEMS, PRIORITY_META } from "@exitplan/core";
import type { ChecklistItem, ChecklistPhase } from "@exitplan/core";
import { CheckSquare, Square, ChevronDown, ChevronRight, ArrowLeft, BookOpen } from "lucide-react-native";

function ChecklistItemRow({
  item,
  isCompleted,
  onToggle,
}: {
  item: ChecklistItem;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const priorityMeta = PRIORITY_META[item.priority];

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border + "30", paddingVertical: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <TouchableOpacity onPress={onToggle} style={{ paddingTop: 2 }}>
          {isCompleted ? (
            <CheckSquare size={20} color={colors.emerald500} />
          ) : (
            <Square size={20} color={colors.mutedForeground} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setExpanded(!expanded)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              variant="body-sm"
              style={{
                flex: 1,
                fontWeight: "500",
                color: isCompleted ? colors.mutedForeground : colors.foreground,
                textDecorationLine: isCompleted ? "line-through" : "none",
              }}
            >
              {item.title}
            </Text>
            {expanded ? (
              <ChevronDown size={14} color={colors.mutedForeground} />
            ) : (
              <ChevronRight size={14} color={colors.mutedForeground} />
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
            <Badge
              variant={
                item.priority === "critical"
                  ? "destructive"
                  : item.priority === "important"
                  ? "warning"
                  : "secondary"
              }
            >
              {priorityMeta.label}
            </Badge>
          </View>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={{ marginLeft: 32, marginTop: 12, gap: 8 }}>
          <Text variant="body-sm" style={{ color: colors.mutedForeground }}>
            {item.description}
          </Text>
          <View style={{ backgroundColor: colors.primary + "12", borderRadius: 8, padding: 12 }}>
            <Text variant="label" style={{ color: colors.primary, marginBottom: 4 }}>
              Why it matters
            </Text>
            <Text variant="body-sm" style={{ color: colors.accentForeground }}>
              {item.why}
            </Text>
          </View>
          <View style={{ backgroundColor: colors.emerald500 + "12", borderRadius: 8, padding: 12 }}>
            <Text variant="label" style={{ color: colors.emerald700, marginBottom: 4 }}>
              How to do it
            </Text>
            <Text variant="body-sm" style={{ color: colors.accentForeground }}>
              {item.how}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function PhaseSection({
  phase,
  completedIds,
  onToggle,
}: {
  phase: ChecklistPhase;
  completedIds: string[];
  onToggle: (itemId: string, completed: boolean) => void;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const completedCount = phase.items.filter((item) => completedIds.includes(item.id)).length;
  const pct = phase.items.length > 0 ? (completedCount / phase.items.length) * 100 : 0;

  return (
    <Card style={{ marginBottom: 16 }}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variant="caption" style={{ color: colors.primary, fontWeight: "bold" }}>
                  {phase.number}
                </Text>
              </View>
              <Text variant="h4" style={{ color: colors.foreground }}>{phase.title}</Text>
            </View>
            <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: 4, marginLeft: 36 }}>
              {phase.subtitle}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>
              {completedCount}/{phase.items.length}
            </Text>
            {expanded ? (
              <ChevronDown size={16} color={colors.mutedForeground} />
            ) : (
              <ChevronRight size={16} color={colors.mutedForeground} />
            )}
          </View>
        </View>
        <View style={{ height: 4, backgroundColor: colors.muted, borderRadius: 2, overflow: "hidden", marginTop: 12 }}>
          <View style={{ height: "100%", backgroundColor: colors.primary, borderRadius: 2, width: `${pct}%` }} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={{ marginTop: 12 }}>
          {phase.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              isCompleted={completedIds.includes(item.id)}
              onToggle={() => onToggle(item.id, !completedIds.includes(item.id))}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

export default function ChecklistScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: completedIds, isLoading } = useChecklistProgress();
  const toggleItem = useToggleChecklistItem();
  const [refreshing, setRefreshing] = useState(false);

  const totalCompleted = completedIds?.length ?? 0;
  const overallPct = TOTAL_ITEMS > 0 ? (totalCompleted / TOTAL_ITEMS) * 100 : 0;

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["adulting-checklist"] });
    setRefreshing(false);
  }

  function handleToggle(itemId: string, completed: boolean) {
    toggleItem.mutate({ itemId, completed });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}
        >
          <ArrowLeft size={16} color={colors.mutedForeground} />
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Adulting Hub</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <View style={{ height: 40, width: 40, borderRadius: 12, backgroundColor: "#EAB308" + "1A", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={20} color="#CA8A04" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>Filipino Adulting Checklist</Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>A step-by-step guide to getting your life set up</Text>
          </View>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Card style={{ backgroundColor: colors.primary }}>
            <Text variant="h3" style={{ color: colors.primaryForeground, marginBottom: 4 }}>
              Adulting Progress
            </Text>
            <Text variant="body-sm" style={{ color: colors.primaryForeground + "CC", marginBottom: 12 }}>
              {totalCompleted} of {TOTAL_ITEMS} items completed
            </Text>
            <View style={{ height: 8, backgroundColor: colors.primaryForeground + "33", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
              <View style={{ height: "100%", backgroundColor: colors.primaryForeground, borderRadius: 4, width: `${overallPct}%` }} />
            </View>
            <Text variant="caption" style={{ color: colors.primaryForeground + "CC" }}>
              {overallPct.toFixed(0)}% complete
            </Text>
          </Card>
        </View>

        {/* Phases */}
        <View style={{ paddingHorizontal: 16 }}>
          {isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ height: 128, backgroundColor: colors.muted, borderRadius: 10 }} />
              ))}
            </View>
          ) : (
            CHECKLIST_PHASES.map((phase) => (
              <PhaseSection
                key={phase.id}
                phase={phase}
                completedIds={completedIds ?? []}
                onToggle={handleToggle}
              />
            ))
          )}
        </View>
    </ScrollView>
  );
}
