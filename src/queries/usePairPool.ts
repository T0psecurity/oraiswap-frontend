export default () => {
  const generate = ({ token, pair }: ListedItem) => {
    return { token, contract: pair, msg: { pool: {} } };
  };

  const query = { result: null, parsed: null };
  return query;
};
