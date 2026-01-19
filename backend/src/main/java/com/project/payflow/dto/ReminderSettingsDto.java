// src/main/java/com/project/payflow/dto/ReminderSettingsDto.java
package com.project.payflow.dto;

import com.project.payflow.entities.ReminderSettings;

public class ReminderSettingsDto {

    private Integer dueSoonDaysBefore;
    private Integer overdueDays1;
    private Integer overdueDays2;
    private boolean enabled;

    public ReminderSettingsDto() {}

    public ReminderSettingsDto(Integer dueSoonDaysBefore,
                               Integer overdueDays1,
                               Integer overdueDays2,
                               boolean enabled) {
        this.dueSoonDaysBefore = dueSoonDaysBefore;
        this.overdueDays1 = overdueDays1;
        this.overdueDays2 = overdueDays2;
        this.enabled = enabled;
    }

    public static ReminderSettingsDto fromEntity(ReminderSettings rs) {
        return new ReminderSettingsDto(
                rs.getDueSoonDaysBefore(),
                rs.getOverdueDays1(),
                rs.getOverdueDays2(),
                rs.isEnabled()
        );
    }

    public Integer getDueSoonDaysBefore() { return dueSoonDaysBefore; }
    public void setDueSoonDaysBefore(Integer v) { this.dueSoonDaysBefore = v; }

    public Integer getOverdueDays1() { return overdueDays1; }
    public void setOverdueDays1(Integer v) { this.overdueDays1 = v; }

    public Integer getOverdueDays2() { return overdueDays2; }
    public void setOverdueDays2(Integer v) { this.overdueDays2 = v; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}