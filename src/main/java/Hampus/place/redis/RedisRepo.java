package Hampus.place.redis;

import Hampus.place.Pixel;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.BinaryJedis;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

@Repository
@Component
public class RedisRepo {

  public static final String KEY = "place";
  public static int IMAGE_SIZE = 1000;



  private Jedis jedis;
  private  BinaryJedis binaryJedis;

  final JedisPoolConfig poolConfig = buildPoolConfig();
  JedisPool jedisPool;


  public RedisRepo(@Value("${spring.redis.host}") String redisHost){
    jedis  = new Jedis(redisHost);
    binaryJedis  = new BinaryJedis(redisHost);
    jedisPool = new JedisPool(poolConfig, "localhost");
  }

  public void setPixel(Pixel p){
  int pp = ((p.getX()+p.getY()*IMAGE_SIZE)*4);
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(pp), String.valueOf(p.getColor()));
  }

  public Pixel getPixel(int x, int y){
    //To start redis: redis-server /usr/local/etc/redis.conf
    int pp = (x+y*IMAGE_SIZE)*4;
    List<Long> l = jedis.bitfield(KEY,
        "GET", "u4", String.valueOf(pp));
    return Pixel.builder().color(l.get(0).intValue()).x(x).y(y).build();
  }

  public byte[] getAllPixels(){
    return binaryJedis.get(KEY.getBytes());
  }


  private JedisPoolConfig buildPoolConfig() {
    final JedisPoolConfig poolConfig = new JedisPoolConfig();
    poolConfig.setMaxTotal(128);
    poolConfig.setMaxIdle(128);
    poolConfig.setMinIdle(16);
    poolConfig.setTestOnBorrow(true);
    poolConfig.setTestOnReturn(true);
    poolConfig.setTestWhileIdle(true);
    poolConfig.setMinEvictableIdleTimeMillis(Duration.ofSeconds(60).toMillis());
    poolConfig.setTimeBetweenEvictionRunsMillis(Duration.ofSeconds(30).toMillis());
    poolConfig.setNumTestsPerEvictionRun(3);
    poolConfig.setBlockWhenExhausted(true);
    return poolConfig;
  }

}
