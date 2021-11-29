import "@assets/styles/Stepper.less";
import React, { useLayoutEffect, useRef } from "react";

import Tick from "@assets/images/tick.svg";

interface Props {
    step: number;
    stepTitles: string[];
    stepMaxHeights: number[];
    children: JSX.Element[];
}

const Stepper = (props: Props) => {
    return (
        <>
            {props.children.map((child, index) => {
                const active = props.step === index;
                const done = index < props.step;

                return (
                    <div
                        key={index}
                        className={
                            "Stepper__entry" +
                            (active ? " Stepper__entry--active" : "") +
                            (done ? " Stepper__entry--done" : "")
                        }
                        style={
                            {
                                "--max-height": `${props.stepMaxHeights[index]}px`,
                            } as React.CSSProperties
                        }
                    >
                        <div className="Stepper__label">
                            <div className="Stepper__number">{done ? <img src={Tick} /> : index + 1}</div>
                            {props.stepTitles[index]}
                        </div>
                        <div className={"Stepper__content"}>
                            <fieldset disabled={!active}>
                                <div className={"Stepper__inner"}>{child}</div>
                            </fieldset>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default Stepper;
