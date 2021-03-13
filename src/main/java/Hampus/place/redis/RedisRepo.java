package Hampus.place.redis;

import java.util.BitSet;
import java.util.List;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;

@Repository
public class RedisRepo {

  public static final String KEY = "place";
  private static int IMAGE_SIZE = 1000;

  private Jedis jedis = new Jedis("localhost");

  public void setPixel(int x, int y, int r, int g, int b, int a){
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(x+y*IMAGE_SIZE), String.valueOf(r));
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(x+y*IMAGE_SIZE+4), String.valueOf(g));
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(x+y*IMAGE_SIZE+8), String.valueOf(b));
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(x+y*IMAGE_SIZE+12), String.valueOf(a));
  }

  public List<Long> getPixel(int x, int y){
    //To start redis: redis-server /usr/local/etc/redis.conf
    return
        jedis.bitfield(KEY,
            "GET", "u4", String.valueOf(x+y*IMAGE_SIZE),
            "GET", "u4", String.valueOf(x+y*IMAGE_SIZE+4),
            "GET", "u4", String.valueOf(x+y*IMAGE_SIZE+8),
            "GET", "u4", String.valueOf(x+y*IMAGE_SIZE+12));
  }




}
