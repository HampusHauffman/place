package Hampus.place.redis;

import Hampus.place.Pixel;
import java.util.BitSet;
import java.util.List;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;

@Repository
public class RedisRepo {

  public static final String KEY = "place";
  private static int IMAGE_SIZE = 1000;

  private Jedis jedis = new Jedis("localhost");

  public void setPixel(Pixel p){
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(p.getX()+ p.getY()*IMAGE_SIZE), String.valueOf(p.getR()));
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(p.getX()+ p.getY()*IMAGE_SIZE+4), String.valueOf(p.getG()));
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(p.getX()+ p.getY()*IMAGE_SIZE+8), String.valueOf(p.getB()));
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(p.getX()+ p.getY()*IMAGE_SIZE+12), String.valueOf(15));

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
