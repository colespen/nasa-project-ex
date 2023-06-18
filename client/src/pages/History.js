import { useMemo, useState, useEffect, useCallback } from "react";
import { Appear, Table, Paragraph, Button } from "arwes";

import { httpGetLaunches } from "../hooks/requests";

const History = (props) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pageLaunches, setPageLaunches] = useState(props.launches);

  const setViewLauches = useCallback(async () => {
    const launches = await httpGetLaunches(page, limit);
    setPageLaunches(launches);
  }, [limit, page]);

  useEffect(() => {
    setViewLauches();
  }, [setViewLauches]);

  const handleNextPage = async () => {
    setPage(page + 1);
  };
  const handlePrevPage = async () => {
    if (page === 1) return;
    setPage(page - 1);
  };

  const tableBody = useMemo(() => {
    return pageLaunches
      ?.filter((launch) => !launch.upcoming)
      .map((launch) => {
        return (
          <tr key={String(launch.flightNumber)}>
            <td>
              <span style={{ color: launch.success ? "greenyellow" : "red" }}>
                █
              </span>
            </td>
            <td>{launch.flightNumber}</td>
            <td>{new Date(launch.launchDate).toDateString()}</td>
            <td>{launch.mission}</td>
            <td>{launch.rocket}</td>
            <td>{launch.customers?.join(", ")}</td>
          </tr>
        );
      });
  }, [pageLaunches]);

  return (
    <>
      <div>
        <Button onClick={handlePrevPage}>prev</Button>
        <Button onClick={handleNextPage}>next</Button>
        <label>pg. {page}</label>
        <label>limit:</label>
        <input value={limit} onChange={(e) => setLimit(e.target.value)} />
      </div>
      <article id="history">
        <Appear animate show={props.entered}>
          <Paragraph>
            History of mission launches including SpaceX launches starting from
            the year 2006.
          </Paragraph>
          <Table animate>
            <table style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ width: "2rem" }}></th>
                  <th style={{ width: "3rem" }}>No.</th>
                  <th style={{ width: "9rem" }}>Date</th>
                  <th>Mission</th>
                  <th style={{ width: "7rem" }}>Rocket</th>
                  <th>Customers</th>
                </tr>
              </thead>
              <tbody>{tableBody}</tbody>
            </table>
          </Table>
        </Appear>
      </article>
    </>
  );
};

export default History;
