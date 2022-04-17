import React from "react";
import ChartModel from "../lib/model";
import styles from "../styles.module.css";

interface LabelButtonsProps {
    chartLabels: string[] | null;
    chartModel: ChartModel;
    handleChartChangeClick: Function;
}

export const LabelButtons: React.FC<LabelButtonsProps> = ({
    chartLabels,
    chartModel,
    handleChartChangeClick
}) => {
    return (
        <div>
            {chartLabels === null ? null : (
                <div className={styles.buttonContainer}>
                    {chartLabels.map((value, index) => (
                        <button
                            style={
                                index === chartModel?.state
                                    ? {
                                          borderBottomWidth: 3,
                                          borderColor:
                                              chartModel.data.buttonColor,
                                          borderStyle: "solid"
                                      }
                                    : {}
                            }
                            key={index}
                            onClick={() => handleChartChangeClick(index)}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
