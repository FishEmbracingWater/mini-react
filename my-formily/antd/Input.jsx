import React, { useState, useEffect } from "react";

const MyInput = (props) => {
    return <input {...props} value={props.value || ""}></input>;
};
export default MyInput;
