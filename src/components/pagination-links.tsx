import * as React from "react";
import { Link } from "gatsby";

const linkOrText = (
  label: string,
  link: string,
  activeStyle: { [key: string]: string } = {},
  inactiveStyle: { [key: string]: string } = {},
): JSX.Element => (
  link ? (
    <Link to={link} style={activeStyle}>
      {label}
    </Link>
  ) : (
    <span style={inactiveStyle}>{label}</span>
  )
);

type PaginationLinksProps = {
  previousLabel?: string,
  nextLabel?: string,
  pageLabel?: string,
  separator?: string,
  activeStyle?: { [key: string]: string },
  inactiveStyle?: { [key: string]: string },
  pageContext: {
    humanPageNumber: number,
    previousPagePath?: string,
    nextPagePath?: string,
  }
};

export default function PaginationLinks({
  previousLabel,
  nextLabel,
  pageLabel,
  separator,
  activeStyle,
  inactiveStyle,
  pageContext: {
    humanPageNumber,
    previousPagePath,
    nextPagePath,
  },
}: PaginationLinksProps): JSX.Element {
  return (
    <div className="has-text-centered">
      {linkOrText(previousLabel, previousPagePath, activeStyle, inactiveStyle)}
      {separator}
      {pageLabel.replace(`%d`, humanPageNumber.toString())}
      {separator}
      {linkOrText(nextLabel, nextPagePath)}
    </div>
  );
}

PaginationLinks.defaultProps = {
  previousLabel: `← previous`,
  nextLabel: `next →`,
  pageLabel: `Page: %d`,
  separator: ` - `,
  activeStyle: {},
  inactiveStyle: { textDecorationLine: `line-through`, color: `grey` },
};
