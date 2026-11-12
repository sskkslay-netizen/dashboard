/* ACT-specific goals, skill-level overrides, and browser backup. */
(function () {
    "use strict";

    function showMessage(id, message, isError = false) {
        const element = document.getElementById(id);
        element.textContent = message;
        element.classList.toggle("error", isError);
    }

    function syncSkills() {
        const subject = document.getElementById("settingSubject").value;
        const select = document.getElementById("settingSkill");
        select.innerHTML = ACTData.SUBJECTS[subject]
            .map(skill => `<option value="${ACTData.skillId(subject, skill)}">${skill}</option>`)
            .join("");
        renderSelectedSkill();
    }

    function renderSelectedSkill() {
        const state = ACTData.getState();
        const skill = state.skills[document.getElementById("settingSkill").value];
        if (!skill) return;
        document.getElementById("settingSkillLevel").value = skill.manualLevel || "Automatic";
        const displayed = ACTData.getSkillLevel(skill);
        document.getElementById("skillSettingSummary").textContent =
            `${skill.name} · score ${skill.score}/100 · currently ${displayed}`;
    }

    function exportData() {
        try {
            const data = ACTData.getState();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `study-archive-act-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showMessage("backupMessage", "ACT backup downloaded.");
        } catch (error) {
            showMessage("backupMessage", error.message, true);
        }
    }

    function init() {
        try {
            ACTData.init();
            const goals = ACTData.getState().goals;
            document.getElementById("settingDailyMinutes").value = goals.dailyMinutes;
            document.getElementById("settingDailyLessons").value = goals.dailyLessons;
            document.getElementById("settingWeeklyLessons").value = goals.weeklyLessons;
            syncSkills();

            document.getElementById("goalSettingsForm").addEventListener("submit", event => {
                event.preventDefault();
                const values = new FormData(event.currentTarget);
                try {
                    ACTData.updateGoals({
                        dailyMinutes: values.get("dailyMinutes"),
                        dailyLessons: values.get("dailyLessons"),
                        weeklyLessons: values.get("weeklyLessons")
                    });
                    showMessage("goalMessage", "Study goals saved.");
                } catch (error) {
                    showMessage("goalMessage", error.message, true);
                }
            });
            document.getElementById("settingSubject").addEventListener("change", syncSkills);
            document.getElementById("settingSkill").addEventListener("change", renderSelectedSkill);
            document.getElementById("saveSkillLevel").addEventListener("click", () => {
                try {
                    ACTData.setSkillLevel(
                        document.getElementById("settingSkill").value,
                        document.getElementById("settingSkillLevel").value
                    );
                    renderSelectedSkill();
                    showMessage("skillSettingMessage", "Skill level saved.");
                } catch (error) {
                    showMessage("skillSettingMessage", error.message, true);
                }
            });
            document.getElementById("exportACTData").addEventListener("click", exportData);
        } catch (error) {
            showMessage("goalMessage", error.message, true);
            console.error(error);
        }
    }

    document.addEventListener("DOMContentLoaded", init);
}());
