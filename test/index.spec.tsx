import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "../example/App";

test("App", () => {
  const { getByText } = render(<App initialValue={10} />);
  expect(getByText('10')).toBeDefined();
  fireEvent.click(getByText('+'));
  expect(getByText('11')).toBeDefined();
  fireEvent.click(getByText('-'));
  fireEvent.click(getByText('-'));
  expect(getByText('9')).toBeDefined();
});
